import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  SPACE_ICONS: string[];
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  editIcon: string;
  setEditIcon: (icon: string) => void;
  editName: string;
  setEditName: (name: string) => void;
  handleUpdateSpace: () => void;
  isPending: boolean;
};

export default function EditDialog({
  SPACE_ICONS,
  isEditDialogOpen,
  setIsEditDialogOpen,
  editIcon,
  setEditIcon,
  editName,
  setEditName,
  handleUpdateSpace,
  isPending,
}: Props) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Space</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Icon
            </label>
            <div className="flex flex-wrap gap-1 p-2 rounded-xl bg-muted/30 border border-border/40">
              {SPACE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setEditIcon(icon)}
                  className={cn(
                    'text-xl p-1.5 rounded-lg transition-all',
                    editIcon === icon ? 'bg-primary/30 scale-110 shadow-sm' : 'hover:bg-muted/50',
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Space name..."
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateSpace} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
