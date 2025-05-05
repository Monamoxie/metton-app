"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/schemas/identity-schemas";
import {
  ProfileUpdateInputs,
  UserProfile,
  UserProfileCardProps,
} from "@/types/identity";
import ErrorDisplay from "@/components/ErrorDisplay";
import ButtonContent from "@/components/ButtonContent";
import { useTranslations } from "next-intl";
import { localApiRequest } from "@/utils/utils";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { useTheme } from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import * as UserService from "@/services/user-service";
import CircularProgressBox from "@/components/loaders/CircularProgressBox";

export interface UserProfileFormProps {
  user: UserProfile;
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const t = useTranslations();
  const theme = useTheme();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileUpdateInputs>({
    resolver: zodResolver(profileUpdateSchema(t)),
    defaultValues: {
      name: user.name || "",
      company: user.company || "",
      position: user.position || "",
      profile_summary: user.profile_summary || "",
    },
  });

  // Update image preview when a file is selected
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const onSubmit: SubmitHandler<ProfileUpdateInputs> = async (data) => {
    console.log("GOt in");
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("company", data.company || "");
    formData.append("position", data.position || "");
    formData.append("profile_summary", data.profile_summary || "");
    if (selectedFile) formData.append("profile_photo", selectedFile);

    // await localApiRequest({
    //   url: "/api/identity/update-profile",
    //   method: "POST",
    //   body: formData,
    //   setProcessing,
    //   setResponseErrors,
    //   setIsFinished,
    // });
  };

  return (
    <>
      <Typography component="h4" variant="h4" gutterBottom>
        Update Profile
      </Typography>
      {responseErrors && <ErrorDisplay errors={responseErrors} />}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ mt: 2 }}
      >
        {/* Profile Photo */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            component="img"
            src={imagePreview || "/placeholder.jpg"}
            alt="Profile Preview"
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              mr: 2,
            }}
          />
          <IconButton
            component="label"
            sx={{
              background: "rgba(0, 0, 0, 0.04)",
              borderRadius: "50%",
              p: 1,
            }}
          >
            <CloudUploadIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                if (e.target.files) setSelectedFile(e.target.files[0]);
              }}
            />
          </IconButton>
        </Box>

        {/* Name */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Name</FormLabel>
          <TextField
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            variant="outlined"
          />
        </FormControl>

        {/* Email (Read-Only) */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Email</FormLabel>
          <TextField
            {...register("email")}
            disabled
            error={!!errors.email}
            helperText={errors.email?.message}
            variant="outlined"
          />
        </FormControl>

        {/* Company */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Company</FormLabel>
          <TextField
            {...register("company")}
            error={!!errors.company}
            helperText={errors.company?.message}
            variant="outlined"
          />
        </FormControl>

        {/* Position */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>Position</FormLabel>
          <TextField
            {...register("position")}
            error={!!errors.position}
            helperText={errors.position?.message}
            variant="outlined"
          />
        </FormControl>

        {/* Profile Summary */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <FormLabel>About</FormLabel>
          <TextField
            {...register("profile_summary")}
            error={!!errors.profile_summary}
            helperText={errors.profile_summary?.message}
            multiline
            rows={4}
            variant="outlined"
          />
        </FormControl>

        {/* Submit Button */}
        <Button type="submit" variant="contained" disabled={processing}>
          <ButtonContent processing={processing} defaultText="Update Profile" />
        </Button>
      </Box>
    </>
  );
}
