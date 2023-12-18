export interface ShortcutInstructionDto {
  run: string;
  params: Record<string, any>;
}
export interface ShortcutResponseDto {
  response?: string | ShortcutInstructionDto;
  ended: boolean;
}