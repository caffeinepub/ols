import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useMobileAuth } from "../hooks/useMobileAuth";

interface MobileLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileLoginDialog({
  open,
  onOpenChange,
}: MobileLoginDialogProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { login } = useMobileAuth();

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    // Check if it's a valid length (10 digits for Indian numbers without country code, or 12 with +91)
    return cleaned.length === 10 || cleaned.length === 12;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      toast.error("Please enter your mobile number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanedPhone = phoneNumber.replace(/\D/g, "");
    login(cleanedPhone);
    toast.success("Logged in successfully!");
    onOpenChange(false);
    setPhoneNumber("");
  };

  const handleCancel = () => {
    setPhoneNumber("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login with Mobile Number</DialogTitle>
          <DialogDescription>
            Enter your mobile number to access your account and manage your
            listings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Enter 10-digit mobile number (e.g., 9876543210)
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
