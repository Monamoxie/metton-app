import Confetti from "@/components/magicui/confetti";
import SuccessDisplay from "@/components/SuccessDisplay";

const SignUpCompleted = (): React.JSX.Element => {
  return (
    <>
      <Confetti />
      <SuccessDisplay
        title={"Welcome to Metton!"}
        message={"Your account has been successfully created!"}
      >
        A confirmation link has just been sent to your email address. Click on
        the confirmation link to get started.
      </SuccessDisplay>
    </>
  );
};

export default SignUpCompleted;
