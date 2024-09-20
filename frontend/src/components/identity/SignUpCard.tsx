"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Card, Stack } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Identity_Form_Card_Css } from "@/styles/modules/identity/identity-layout.css";
import ForgotPassword from "../../app/identity/signup/ForgotPassword";
import { useForm, SubmitHandler } from "react-hook-form";
import { signupSchema } from "@/schemas/identity";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { signupAction } from "@/data/identity/signup-action";
import { useState } from "react";
export type SignupInputs = z.infer<ReturnType<typeof signupSchema>>;
import ErrorDisplay from "@/components/ErrorDisplay";

export default function SignUpCard() {
  const t = useTranslations();
  const schema = signupSchema(t);
  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [responseData, setResponseData] = useState<{
    [key: string]: string[];
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<SignupInputs> = async (data) => {
    const response = await signupAction(data);
    console.log(response);

    response.code !== 200
      ? setResponseErrors(response.errors)
      : setResponseData(response.data);
  };

  return (
    <Stack direction="column" sx={Identity_Form_Card_Css}>
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
              value="dkd@dkd.com"
              autoFocus
              required
              sx={{ ariaLabel: "email" }}
            />
          </FormControl>
          <FormControl>
            <Box className="password-label-wrap">
              <FormLabel htmlFor="password">Password</FormLabel>
              {/* <Link
                component="button"
                // onClick={handleClickOpen}
                variant="body2"
                sx={{ alignSelf: "baseline" }}
              >
                Forgot your password?
              </Link> */}
            </Box>
            <TextField
              {...register("password")}
              error={!!errors.password}
              helperText={(errors.password?.message as string) || ""}
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              value="123"
              sx={{ ariaLabel: "password" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password-conf">Re-enter Password</FormLabel>
            <TextField
              {...register("password_conf")}
              error={!!errors.password_conf}
              helperText={(errors.password_conf?.message as string) || ""}
              name="password_conf"
              placeholder="••••••"
              type="password"
              id="password-conf"
              autoComplete="confirm-password"
              autoFocus
              required
              value="123"
              sx={{ ariaLabel: "password-conf" }}
            />
          </FormControl>

          <Button type="submit" fullWidth variant="contained">
            Sign Up
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}

//  {/* <Divider>or</Divider> */}
// {/* <ForgotPassword open={open} handleClose={handleClose} /> */}
//  <FormControlLabel
//    control={<Checkbox value="remember" color="primary" />}
//    label="Remember me"
//  />;

/* <Link variant="body2" sx={{ alignSelf: "center" }}>
  Have an account? Sign In
</Link>; */

// const handleClickOpen = () => {
//   setOpen(true);
// };

// const handleClose = () => {
//   setOpen(false);
// };

// };
