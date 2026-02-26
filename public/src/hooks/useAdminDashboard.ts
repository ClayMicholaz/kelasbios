import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Registration } from "@/types/registration";

export function useAdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");
  const [divisionFilter, setDivisionFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewingRegistration, setViewingRegistration] =
    useState<Registration | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);

      // Get registrations with user email
      const { data: registrationsData, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user emails from auth.users
      const userIds = registrationsData?.map((r) => r.user_id) || [];

      if (userIds.length > 0) {
        const { data: usersData } = await supabase.auth.admin.listUsers();

        const enrichedData =
          registrationsData?.map((reg) => {
            const user = usersData.users.find((u) => u.id === reg.user_id);
            return {
              ...reg,
              user_email: user?.email,
            };
          }) || [];

        setRegistrations(enrichedData);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: "pending" | "accepted" | "rejected",
    acceptedDivision?: string
  ) => {
    try {
      setUpdating(registrationId);

      const updateData: { status: string; accepted_division?: string | null } =
        { status };
      if (status === "accepted" && acceptedDivision) {
        updateData.accepted_division = acceptedDivision;
      } else if (status !== "accepted") {
        updateData.accepted_division = null;
      }

      const { error } = await supabase
        .from("registrations")
        .update(updateData)
        .eq("id", registrationId);

      if (error) throw error;

      // Refresh data
      await fetchRegistrations();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (filter !== "all" && reg.status !== filter) return false;
    if (divisionFilter !== "all" && reg.divisi_pertama !== divisionFilter)
      return false;
    return true;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    accepted: registrations.filter((r) => r.status === "accepted").length,
    rejected: registrations.filter((r) => r.status === "rejected").length,
  };

  const handleTryForm = () => {
    // Open registration form in new tab with force form parameter
    window.open("/dashboard?form=true", "_blank");
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  return {
    registrations,
    loading,
    filter,
    setFilter,
    divisionFilter,
    setDivisionFilter,
    updating,
    viewingRegistration,
    setViewingRegistration,
    filteredRegistrations,
    stats,
    updateRegistrationStatus,
    handleTryForm,
  };
}
