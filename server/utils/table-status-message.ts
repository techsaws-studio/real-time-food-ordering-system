import { TableStatusEnum } from "../enums/models-enums.js";

export function getTableStatusMessage(
  tableNumber: number,
  status: TableStatusEnum
): string {
  const messages: Record<TableStatusEnum, string> = {
    [TableStatusEnum.AVAILABLE]: `Table ${tableNumber} is now available`,
    [TableStatusEnum.OCCUPIED]: `Table ${tableNumber} is now occupied`,
    [TableStatusEnum.RESERVED]: `Table ${tableNumber} has been reserved`,
    [TableStatusEnum.MAINTENANCE]: `Table ${tableNumber} needs maintenance`,
  };

  return messages[status] || `Table ${tableNumber} status updated`;
}
