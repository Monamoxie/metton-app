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
import { ProfileUpdateInputs, UserProfile } from "@/types/identity";
import ErrorDisplay from "@/components/ErrorDisplay";
import ButtonContent from "@/components/ButtonContent";
import { useTranslations } from "next-intl";
import * as UserService from "@/services/user-service";
import { SetStateProp } from "@/types/core";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/CloudUpload";
import Tooltip from "@mui/material/Tooltip";

export interface UserProfileFormProps {
  user: UserProfile;
  setIsFinished: SetStateProp<boolean>;
  setUser: SetStateProp<UserProfile | null>;
}

export default function UserProfileForm({
  user,
  setIsFinished,
  setUser,
}: UserProfileFormProps) {
  const t = useTranslations();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user.profile_photo
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

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
      setRemovePhoto(false);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const onSubmit: SubmitHandler<ProfileUpdateInputs> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("company", data.company || "");
    formData.append("position", data.position || "");
    formData.append("profile_summary", data.profile_summary || "");
    if (selectedFile) formData.append("profile_photo", selectedFile);
    if (removePhoto) formData.append("remove_profile_photo", "true");

    try {
      setProcessing(true);

      const response = await UserService.updateProfile(formData);
      if (response.code === 200) {
        setUser(response.data);
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
    <Card sx={{ p: 10 }}>
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
            src={imagePreview || "https://place-hold.it/300x500"}
            alt="Profile Preview"
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              mr: 2,
            }}
          />

          <Stack direction="row" spacing={2}>
            {/* Upload Button */}
            <Tooltip title="Upload Photo">
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) setSelectedFile(e.target.files[0]);
                  }}
                />
              </Button>
            </Tooltip>

            {/* Clear Photo Button */}
            <Tooltip title="Remove Photo">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreview(null);
                  setRemovePhoto(true);
                }}
              >
                Remove
              </Button>
            </Tooltip>
          </Stack>
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
    </Card>
  );
}
