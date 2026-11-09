import React, { useEffect, useState } from "react";
import { Image, Platform, Text, View } from "react-native";
import { apiRequest, API_BASE_URL } from "../../../config/api";
import { colors } from "../../../theme/colors";
import SaheliLoader from '../../../components/SaheliLoader';

export default function ProtectedDocument({ owner, documentKey }) {
  const [source, setSource] = useState(null), [error, setError] = useState(false);
  useEffect(() => {
    let active = true, url;
    const endpoint = `/passenger/verification/documents/${documentKey}`;
    setError(false); setSource(null);
    if (process.env.NODE_ENV === "production" && !API_BASE_URL.startsWith("https://")) { setError(true); return; }
    if (Platform.OS === "web") {
      apiRequest(endpoint, { authenticated: true, expectedSession: owner, responseType: "blob", requireHttps: true }).then(blob => {
        if (!active) return;
        url = URL.createObjectURL(blob); setSource({ uri: url });
      }).catch(() => { if (active) setError(true); });
    } else setSource({ uri: API_BASE_URL + endpoint, headers: { Authorization: `Bearer ${owner.accessToken}` }, cache: "reload" });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [owner, documentKey]);
  return <View>{error ? <Text accessibilityRole="alert" style={{ color: colors.error, lineHeight: 22 }}>Unable to load this protected document. Refresh status and retry.</Text>
    : source ? <Image accessibilityLabel={`Submitted ${documentKey === "selfie" ? "selfie" : "CNIC"}`} source={source} resizeMode="contain" style={{ height: 180, width: "100%" }} onError={() => setError(true)} />
      : <SaheliLoader label="Loading protected document..." />}</View>;
}
