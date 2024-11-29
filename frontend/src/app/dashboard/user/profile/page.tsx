import ProfileCard from "@/components/dashboard/user/ProfileCard";
import { getUserProfile } from "@/data/outbound/identity-fetcher";
import { Container } from "@mui/material";
import ErrorDisplay from "@/components/ErrorDisplay";

export default async function ProfilePage() {
  const response = await getUserProfile();
  let errorContent = null;

  if (response.code !== 200) {
    errorContent = <ErrorDisplay errors={response.errors} />;
  } else {
    let data = response.data;

    if (data.profile_photo?.trim()) {
      data["profile_photo"] = process.env.TEMP_APP_URL + data.profile_photo;
    }
  }

  return (
    <Container>
        {errorContent || (
          <ProfileCard
            user={response.data}
            base_url={process.env.APP_URL ?? null}
          />
        )}
    </Container>
  );
}
