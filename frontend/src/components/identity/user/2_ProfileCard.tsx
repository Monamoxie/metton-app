"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  FormControl,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useTheme } from "@mui/material";
import { PROFILE_CARD_CSS } from "@/styles/modules/identity.css";
import { ProfileUpdateInputs, UserProfileCardProps } from "@/types/identity";
import { getUserPublicProfileUrl, localApiRequest } from "@/utils/utils";
import ButtonContent from "@/components/ButtonContent";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { profileUpdateSchema } from "@/schemas/identity-schemas";
import { useEffect } from "react";
export default function ProfileCard({ user, base_url }: UserProfileCardProps) {
  const theme = useTheme();

  const [responseErrors, setResponseErrors] = useState<{
    [key: string]: string[];
  }>({});
  const [processing, setProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const t = useTranslations();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInputs>({
    resolver: zodResolver(profileUpdateSchema(t)),
  });

  const onSubmit: SubmitHandler<ProfileUpdateInputs> = async (data) => {
    await localApiRequest({
      url: "/api/identity/profile",
      method: "PATCH",
      body: data,
      setProcessing,
      setResponseErrors,
      setIsFinished,
    });
  };

  // const onSubmit = async (data: ProfileUpdateInputs) => {
  //   const formData = new FormData();
  //   formData.append("name", data.name);
  //   formData.append("company", data.company || "");
  //   formData.append("position", data.position || "");
  //   formData.append("profile_summary", data.profile_summary || "");
  //   if (selectedFile) {
  //     formData.append("profile_photo", selectedFile);
  //   }

  //   console.log("YESSSS");

  //   try {
  //     setProcessing(true);
  //     // Replace with your API call
  //     console.log(formData);
  //     // await yourApiCallToUpdateProfile(formData);
  //     // setIsFinished(true);
  //   } catch (error) {
  //     setResponseErrors(error.response.data.errors);
  //   } finally {
  //     setProcessing(false);
  //   }
  // };

  return (
    <Box sx={PROFILE_CARD_CSS(theme)}>
      {/* Header Section */}
      <Box className="pf-header">
        <Box
          component="img"
          src={user.profile_photo as string}
          className="pf-header-img"
        />
        <Box>
          <Box className="pf-name">
            <Typography variant="h6">{user.name}</Typography>
            <VerifiedIcon className="pf-verified-icon" />
          </Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user.position}
          </Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ p: 3 }}
      >
        {/* Public Profile */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Profile Link
          </Typography>
          <TextField
            fullWidth
            value={getUserPublicProfileUrl(user.public_id, base_url)}
            variant="outlined"
            size="small"
            disabled={true}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Email
          </Typography>
          <TextField
            fullWidth
            value={user.email}
            variant="outlined"
            size="small"
            disabled={true}
          />
        </Box>

        {/* Profile Photo */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Update Profile Photo
          </Typography>

          <Box className="pf-upload-profile-photo-wrapper">
            <Box
              component="img"
              src={user.profile_photo as string}
              className="pf-upload-profile-photo-preview"
            />
            <Box className="pf-upload-profile-photo-dropper">
              <input
                {...register("profile_photo")}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <IconButton component="span">
                  <CloudUploadIcon />
                </IconButton>
                <Typography variant="body2">
                  Click to upload or drag and drop
                </Typography>
              </label>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                SVG, PNG, JPG or GIF (max. 800x400px)
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Name  */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Name
          </Typography>
          <TextField
            {...register("name")}
            error={!!errors.name}
            helperText={(errors.name?.message as string) || ""}
            id="name"
            type="name"
            sx={{ ariaLabel: "email" }}
            fullWidth
            value={user.name}
            variant="outlined"
            size="small"
          />
        </Box>

        {/*  */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Company
          </Typography>
          <TextField
            fullWidth
            value={user.company}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            Position
          </Typography>
          <TextField
            fullWidth
            value={user.position}
            variant="outlined"
            size="small"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            About
          </Typography>
          <TextField
            fullWidth
            value={user.profile_summary}
            variant="outlined"
          />
        </Box>

        <Button type="submit" variant="contained" disabled={processing}>
          <ButtonContent processing={processing} defaultText="Update Profile" />
        </Button>
      </Box>
    </Box>
  );
}


