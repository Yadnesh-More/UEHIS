import type { EmergencyPersistedState } from '@/lib/emergency-types'
import { getDefaultEmergencyState } from '@/lib/emergency-seed'
import { getMongoClient, MONGODB_DB_NAME } from '@/lib/mongodb'

const COLLECTION = 'emergency_workspace'
const DOC_ID = 'default'

type WorkspaceDoc = EmergencyPersistedState & { _id: string; updatedAt: Date }

function stripDoc(doc: WorkspaceDoc | null): EmergencyPersistedState | null {
  if (!doc) return null
  const { _id: _drop, updatedAt: _u, ...rest } = doc
  return rest
}

export async function getEmergencyState(): Promise<EmergencyPersistedState> {
  const client = await getMongoClient()
  const col = client.db(MONGODB_DB_NAME).collection<WorkspaceDoc>(COLLECTION)
  let doc = await col.findOne({ _id: DOC_ID })
  if (!doc) {
    const seed = getDefaultEmergencyState()
    await col.insertOne({
      _id: DOC_ID,
      ...seed,
      updatedAt: new Date(),
    })
    doc = await col.findOne({ _id: DOC_ID })
  }
  const state = stripDoc(doc)
  if (!state) return getDefaultEmergencyState()
  return state
}

export async function saveEmergencyState(state: EmergencyPersistedState): Promise<void> {
  const client = await getMongoClient()
  const col = client.db(MONGODB_DB_NAME).collection<WorkspaceDoc>(COLLECTION)
  await col.replaceOne(
    { _id: DOC_ID },
    {
      _id: DOC_ID,
      ...state,
      updatedAt: new Date(),
    },
    { upsert: true }
  )
}
