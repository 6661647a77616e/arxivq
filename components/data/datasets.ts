import { parseTOON, extractQuestions } from "@/lib/parse-toon"

export type DatasetEntry = {
  key: string
  label: string
  // Can be an array of questions or an object with { questions }
  data: unknown
}

import obbToon from "./obb.toon"
import ensembleToon from "./ensemble.toon"
import spmChemisToon from "./spm-chemis.toon"
import psychologyToon from "./psycho.toon" // https://arxiv.org/pdf/2509.04343
import arcMemoToon from "./something.toon"
import aiToon from "./ai.toon"

const toDataset = (rawToon: string) => {
  const parsed = parseTOON(rawToon)
  const questions = extractQuestions(parsed)
  return { questions }
}

export const datasets: DatasetEntry[] = [
  { key: "obb", label: "OBB", data: toDataset(obbToon) },
  { key: "ensemble", label: "Ensemble", data: toDataset(ensembleToon) },
  { key: "spm-chemis", label: "SPM Chemis", data: toDataset(spmChemisToon) },
  { key: "arc-memo", label: "Arc Memo", data: toDataset(arcMemoToon) },
  { key: "psychology", label: "Psychology", data: toDataset(psychologyToon) },
  { key: "ai", label: "AI", data: toDataset(aiToon) },
]