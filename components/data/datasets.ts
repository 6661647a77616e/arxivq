export type DatasetEntry = {
  key: string
  label: string
  // Can be an array of questions or an object with { questions }
  data: unknown
}

import obb from "./obb.json"
import ensemble from "./ensemble.json"
import ai from "./ai.json"
import spmChemis from "./spm-chemis.json"
import physchology from "./psycho.json" //https://arxiv.org/pdf/2509.04343
import aiData from "./ai.json"

export const datasets: DatasetEntry[] = [
  { key: "obb", label: "OBB", data: obb },
  { key: "ensemble", label: "Ensemble", data: ensemble },
  { key: "spm-chemis", label: "SPM Chemis", data: spmChemis },
  { key: "arc-memo", label: "Arc Memo", data: ai },
  { key: "psychology", label: "Psychology", data: physchology },  
  { key: "ai", label: "AI", data: ai },
]