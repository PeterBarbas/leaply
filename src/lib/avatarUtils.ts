// Avatar utility functions
export const avatarOptions = [
  { id: 'avatar1', emoji: '👨‍💻', name: 'Developer' },
  { id: 'avatar2', emoji: '👩‍🎨', name: 'Designer' },
  { id: 'avatar3', emoji: '👨‍💼', name: 'Business' },
  { id: 'avatar4', emoji: '👩‍🔬', name: 'Scientist' },
  { id: 'avatar5', emoji: '👨‍🎓', name: 'Student' }
] as const

export type AvatarId = typeof avatarOptions[number]['id']

export function getAvatarEmoji(avatarId?: string | null): string {
  if (!avatarId) return '👤'
  const avatar = avatarOptions.find(option => option.id === avatarId)
  return avatar?.emoji || '👤'
}

export function getAvatarName(avatarId?: string | null): string {
  if (!avatarId) return 'Default'
  const avatar = avatarOptions.find(option => option.id === avatarId)
  return avatar?.name || 'Default'
}
