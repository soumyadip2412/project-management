import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteProjectModal({ isOpen, onClose, project, onConfirm, deleting }) {
  const [confirmationName, setConfirmationName] = useState("");

  const handleConfirm = () => {
    if (confirmationName === project?.name) {
      onConfirm();
    }
  };

  // Reset state when modal opens
  const handleOpenChange = (open) => {
    if (!open) {
      setConfirmationName("");
    }
    onClose(open);
  };

  const isMatched = confirmationName === project?.name;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-red-500/20 bg-background shadow-2xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-white">
            Delete Project
          </DialogTitle>
          <DialogDescription className="text-center text-slate-400 mt-2">
            This action cannot be undone. This will permanently delete the{" "}
            <span className="font-semibold text-slate-200">{project?.name}</span> project, 
            along with all its tasks, sprints, notes, and member associations.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          <label className="text-sm font-medium text-slate-300">
            Please type <span className="font-bold text-white select-all">{project?.name}</span> to confirm.
          </label>
          <input
            type="text"
            className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-red-500/50"
            value={confirmationName}
            onChange={(e) => setConfirmationName(e.target.value)}
            placeholder={project?.name}
          />
        </div>

        <DialogFooter className="sm:justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isMatched || deleting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "I understand, delete this project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
