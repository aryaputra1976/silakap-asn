import { Badge } from "react-bootstrap"

import type { DmsImportStatus } from "../types"
import {
  getDmsStatusLabel,
  getDmsStatusVariant,
} from "../utils"

type Props = {
  status: DmsImportStatus
}

export function DmsBatchStatusBadge({ status }: Props) {
  return (
    <Badge bg={getDmsStatusVariant(status)}>
      {getDmsStatusLabel(status)}
    </Badge>
  )
}