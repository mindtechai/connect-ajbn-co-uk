import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Eye, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { ActivateMessagingDialog } from "@/components/messaging/ActivateMessagingDialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMessagingProfile } from "@/hooks/useMessagingProfile";
import { useReviewerMode } from "@/hooks/useReviewerMode";
import { MemberSafetyActions } from "@/components/safety/MemberSafetyActions";
import { revealMemberContact } from "@/lib/member-contact.functions";
import { startOrGetConversation } from "@/lib/messaging";

type MemberTarget = {
  id: string;
  name: string;
  calendlyUrl: string | null | undefined;
  messagingActive: boolean;
};

type Props = {
  member: MemberTarget;
  showContact?: boolean;
  compact?: boolean;
};

type Contact = { email: string | null; phone: string | null };

export async function openMemberConversation(memberId: string) {
  const conversationId = await startOrGetConversation(memberId);
  if (!conversationId) throw new Error("Could not open the chat. Please sign in again.");
  return conversationId;
}

export function MemberActions({ member, showContact = false, compact = false }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isActive, activate } = useMessagingProfile();
  const [activationOpen, setActivationOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [revealing, setRevealing] = useState(false);
  const reviewerMode = useReviewerMode();
  const reveal = useServerFn(revealMemberContact);
  const isSelf = user?.id === member.id;
  const bookingUrl = member.calendlyUrl && /^https?:\/\//i.test(member.calendlyUrl)
    ? member.calendlyUrl
    : null;

  const openChat = async () => {
    if (isSelf) return;
    if (!member.messagingActive) {
      toast.info(`${member.name} hasn't enabled messaging yet.`);
      return;
    }
    if (!isActive) {
      setActivationOpen(true);
      return;
    }
    try {
      const conversationId = await openMemberConversation(member.id);
      await navigate({ to: "/messages/$conversationId", params: { conversationId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the chat.");
    }
  };

  const bookOrRequest = async () => {
    if (isSelf || !user) return;
    if (!bookingUrl) {
      await openChat();
      return;
    }
    window.open(bookingUrl, "_blank", "noopener,noreferrer");
    const { error } = await supabase.from("one_to_ones").insert({
      requester_id: user.id,
      target_id: member.id,
      target_name: member.name,
    });
    if (error) console.error("one_to_ones insert failed", error);
    else window.dispatchEvent(new Event("ajbn-one-to-one-logged"));
  };

  const revealContact = async () => {
    if (isSelf || reviewerMode) return;
    setRevealing(true);
    try {
      const details = await reveal({ data: { memberId: member.id } });
      setContact({ email: details.email, phone: details.phone });
      setContactOpen(true);
    } catch {
      toast.error("Contact details could not be revealed.");
    } finally {
      setRevealing(false);
    }
  };

  const buttonSize = compact ? "sm" : "default";

  if (isSelf) return null;

  // Reviewer mode: no contact details or private introductions — moderation only.
  if (reviewerMode) {
    return (
      <MemberSafetyActions
        memberId={member.id}
        memberName={member.name}
        context="profile"
        compact={compact}
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" size={buttonSize} variant="outline" onClick={() => void bookOrRequest()}>
          <CalendarClock size={16} /> {bookingUrl ? "Book 1-2-1" : "Request 1-2-1"}
        </Button>
        <Button type="button" size={buttonSize} variant="outline" onClick={() => void openChat()}>
          <MessageCircle size={16} /> Message
        </Button>
        {showContact && (
          <Button type="button" size={buttonSize} variant="outline" disabled={revealing} onClick={() => void revealContact()}>
            {revealing ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Reveal Contact
          </Button>
        )}
        <div className={showContact ? "col-span-2" : "contents"}>
          <MemberSafetyActions
            memberId={member.id}
            memberName={member.name}
            context="profile"
            compact={compact}
          />
        </div>
      </div>

      <ActivateMessagingDialog
        open={activationOpen}
        onOpenChange={setActivationOpen}
        recipientName={member.name}
        recipientId={member.id}
        activate={activate}
      />

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{member.name}</DialogTitle>
            <DialogDescription>Contact details shared with approved AJBN members.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium break-all">{contact?.email ?? "Not provided"}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{contact?.phone ?? "Not provided"}</dd></div>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}