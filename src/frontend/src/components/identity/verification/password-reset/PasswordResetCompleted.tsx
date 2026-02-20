import Confetti from "../../../magicui/confetti";
import SuccessDisplay from "../../../SuccessDisplay";

export default function PasswordResetCompleted() {
  return (
    <>
      <Confetti />
      <SuccessDisplay
        title={"Password Reset"}
        message={
          "You have a new password. Sign In and continue from where you left off"
        }
        ctaMessage="Sign In"
        ctaUrl="/identity/signin"
      />
    </>
  );
}
