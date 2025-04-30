import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {
  Card,
  Link,
} from "@mui/material";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useForm, SubmitHandler } from "react-hook-form";
import { signupSchema } from "@/schemas/identity-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import ErrorDisplay from "@/components/ErrorDisplay";
import NextLink from "next/link";
import { SignupInputs } from "@/types/identity";
import ButtonContent from "@/components/ButtonContent";
import { PairOfStrings, SetIsFinishedProps } from "@/types/core";
import useRecaptcha from "@/hooks/use-recaptcha";
import * as AuthService from "@/services/auth-service";
import SignUpTermsAndPrivacyPolicy from "./SignUpTermsAndPrivacyPolicy";

const SignUpForm: React.FC<SetIsFinishedProps> = ({ setIsFinished }) => {
  const t = useTranslations();
  const schema = signupSchema(t);

  const [responseErrors, setResponseErrors] = useState<PairOfStrings>({});
  const [processing, setProcessing] = useState(false);

  const { handleRecaptcha } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInputs>({
    resolver: zodResolver(schema),
    defaultValues: {
      // source: "",
    },
  });

  const onSubmit: SubmitHandler<SignupInputs> = async (data) => {
    try {
      setProcessing(true);

      const recaptchaToken = await handleRecaptcha();
      if (recaptchaToken) {
        data.recaptcha = recaptchaToken;
      }

      const response = await AuthService.createAccount(data);
      if (response.code === 200) {
        return setIsFinished(true);
      }

      return setResponseErrors(response.errors);
    } catch (error: any) {
      setResponseErrors({ error: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="identity-form-card">
      <Typography component="h1" variant="h4" className="card-title">
        Create Account
      </Typography>
      {responseErrors && <ErrorDisplay errors={responseErrors} />}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="card-content"
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            {...register("email")}
            error={!!errors.email}
            helperText={(errors.email?.message as string) || ""}
            id="email"
            type="email"
            placeholder={t("prompts.ENTER_YOUR_DATA", {
              data: "email address",
            })}
            autoComplete="true"
            autoFocus
            required
            sx={{ ariaLabel: "email" }}
          />
        </FormControl>
        <FormControl>
          <Box className="password-label-wrap">
            <FormLabel htmlFor="password1">Password</FormLabel>
          </Box>
          <TextField
            {...register("password1")}
            error={!!errors.password1}
            helperText={(errors.password1?.message as string) || ""}
            placeholder="*******"
            type="password"
            id="password1"
            required
            sx={{ ariaLabel: "password1" }}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="password2">Re-enter Password</FormLabel>
          <TextField
            {...register("password2")}
            error={!!errors.password2}
            helperText={(errors.password2?.message as string) || ""}
            name="password2"
            placeholder="*******"
            type="password"
            id="password2"
            required
            sx={{ ariaLabel: "password2" }}
          />
        </FormControl>
        <FormControl sx={{ display: "none" }}>
          <FormLabel htmlFor="source">Source</FormLabel>
          <TextField
            {...register("source")}
            name="source"
            type="hidden"
            id="source"
            required
            sx={{ ariaLabel: "source" }}
          />
        </FormControl>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={processing}
        >
          <ButtonContent
            processing={processing}
            defaultText={"Create Account"}
          />
        </Button>
      </Box>
      <Link href="/identity/signin" component={NextLink}>
        Have an account? Sign In
      </Link>

      <SignUpTermsAndPrivacyPolicy />
    </Card>
  );
};

export default SignUpForm;
