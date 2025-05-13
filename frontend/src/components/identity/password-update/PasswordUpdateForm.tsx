"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordUpdateSchema } from "@/schemas/identity-schemas";
import { PasswordUpdateInputs } from "@/types/identity";
import ErrorDisplay from "@/components/ErrorDisplay";
import ButtonContent from "@/components/ButtonContent";
import { useTranslations } from "next-intl";
import * as UserService from "@/services/user-service";
import SuccessDisplay from "@/components/SuccessDisplay";

export default function PasswordUpdateForm() {
  const t = useTranslations();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFinishedMessage, setIsFinishedMessage] = useState<
    string | undefined
  >("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordUpdateInputs>({
    resolver: zodResolver(passwordUpdateSchema(t)),
  });

  const onSubmit: SubmitHandler<PasswordUpdateInputs> = async (data) => {
    try {
      setProcessing(true);

      const response = await UserService.updatePassword(data);
      if (response.code === 200) {
        setResponseErrors({});
        setIsFinishedMessage(response.message as string);
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
    <Card sx={{ p: 4 }}>
      {responseErrors && <ErrorDisplay errors={responseErrors} />}
      {isFinished && <SuccessDisplay title={isFinishedMessage} />}

      <Typography component="h4" variant="h4" gutterBottom>
        Password Update
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ mt: 2 }}
      >
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Current Password</FormLabel>
          <TextField
            {...register("current_password")}
            error={!!errors.current_password}
            helperText={errors.current_password?.message}
            variant="outlined"
            type="password"
            id="current-password"
            required
            sx={{ ariaLabel: "current-password" }}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>New Password</FormLabel>
          <TextField
            {...register("new_password")}
            error={!!errors.new_password}
            helperText={errors.new_password?.message}
            variant="outlined"
            type="password"
            id="new-password"
            required
            sx={{ ariaLabel: "new-password" }}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 5 }}>
          <FormLabel>Confirm New Password</FormLabel>
          <TextField
            {...register("confirm_new_password")}
            error={!!errors.confirm_new_password}
            helperText={errors.confirm_new_password?.message}
            variant="outlined"
            type="password"
            id="confirm-new-password"
            required
            sx={{ ariaLabel: "confirm-new-password" }}
          />
        </FormControl>

        <Button type="submit" variant="contained" disabled={processing}>
          <ButtonContent
            processing={processing}
            defaultText="Update Password"
          />
        </Button>
      </Box>
    </Card>
  );
}
