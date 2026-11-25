import { ConfirmDeleteButton } from '@/components/confirm-delete-button';
import { useDeleteEntry } from '@/hooks/use-delete-entry';

type DeleteEntryButtonProps = {
  entryId: string;
  onDeleted: () => void;
};

export function DeleteEntryButton({ entryId, onDeleted }: DeleteEntryButtonProps) {
  const deleteEntry = useDeleteEntry();
  return (
    <ConfirmDeleteButton
      label="Delete entry"
      confirmTitle="Delete this entry?"
      confirmMessage="It disappears for everyone, along with its photos, votes and comments."
      onConfirm={async () => {
        await deleteEntry(entryId);
        onDeleted();
      }}
    />
  );
}
