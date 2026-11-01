import type { Entry } from '@/api/entries';
import { Avatar } from '@/components/avatar';
import { Tag, TAG_HEIGHT } from '@/components/tag';

const AVATAR_SIZE = TAG_HEIGHT - 8;

// Who logged the entry, kept small: the card is about the player it's against.
export function FiledByBadge({ filer, isSelfClaim }: { filer: Entry['filer']; isSelfClaim: boolean }) {
  if (isSelfClaim) return <Tag label="Self-claim" accessibilityLabel="Self-claim" />;
  return (
    <Tag
      label={`By ${filer.name}`}
      leading={<Avatar name={filer.name} color={filer.color} photoPath={filer.photo_path} size={AVATAR_SIZE} />}
      accessibilityLabel={`Logged by ${filer.name}`}
    />
  );
}
