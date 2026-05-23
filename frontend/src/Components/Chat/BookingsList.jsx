import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChevronDown,
} from "react-icons/fa";

const BookingsList = ({ userType, userId: propUserId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openBookingMenu, setOpenBookingMenu] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [noteInputs, setNoteInputs] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);

  const localUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");
  const userId = propUserId || localUserId;

  const axiosConfig = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url =
        userType === "caregiver"
          ? `${import.meta.env.VITE_API_URL}/api/bookings/caregiver/${userId}`
          : `${import.meta.env.VITE_API_URL}/api/bookings/user/${userId}`;

      const res = await axios.get(url, axiosConfig);
      setBookings(sortBookingsNewestFirst(res.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortBookingsNewestFirst = (bookingList) => {
    return [...bookingList].sort((a, b) => {
      const aDate = Date.parse(a?.createdAt || a?.startTime || "");
      const bDate = Date.parse(b?.createdAt || b?.startTime || "");
      if (Number.isFinite(aDate) && Number.isFinite(bDate)) {
        return bDate - aDate;
      }
      return 0;
    });
  };

  const filtered = bookings.filter((b) => {
    // Always exclude CANCELLED bookings from display
    if (b.status === "CANCELLED") return false;
    
    // Apply status filter for PENDING, CONFIRMED, COMPLETED
    return statusFilter === "ALL" ? true : b.status === statusFilter;
  });

  const updateBookingStatus = async (bookingId, action) => {
    try {
      setActionLoading(true);
      const endpoint =
        action === "CONFIRMED"
          ? `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/confirm`
          : `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`;
      
      // Immediately remove from UI if declining for better UX
      if (action === "CANCELLED") {
        console.log("🗑️ Declining booking:", bookingId);
        setBookings((prev) => {
          const updated = prev.filter((booking) => booking.id !== bookingId);
          console.log("Updated bookings list, remaining:", updated.length);
          return updated;
        });
      }
      
      const res = await axios.put(endpoint, {}, axiosConfig);
      console.log("✅ Booking status updated:", res.data);
      
      // Update state with response (unless it was already removed)
      if (action !== "CANCELLED") {
        setBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? res.data : booking))
        );
      }
      
      setOpenBookingMenu(null);
      
      // Dispatch events to notify parent components to refetch
      console.log("📢 Dispatching acceptedConnectionsChanged and requestsChanged events");
      try { window.dispatchEvent(new Event("acceptedConnectionsChanged")); } catch (e) { console.warn(e); }
      try { window.dispatchEvent(new Event("requestsChanged")); } catch (e) { console.warn(e); }
      
      // For declined bookings, also do a refresh after a short delay to ensure consistency
      if (action === "CANCELLED") {
        setTimeout(() => {
          console.log("🔄 Refetching bookings after decline");
          fetchBookings();
        }, 500);
      }
      
    } catch (err) {
      console.error("❌ Failed to update booking status:", err);
      // Re-fetch bookings if there was an error
      fetchBookings();
      alert("Unable to update booking status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const completeBooking = async (bookingId) => {
    try {
      setActionLoading(true);
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/complete`, {}, axiosConfig);
      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? res.data : booking))
      );
      setOpenBookingMenu(null);
      try {
        window.dispatchEvent(new Event("acceptedConnectionsChanged"));
      } catch (e) {
        console.warn("Failed to dispatch acceptedConnectionsChanged event", e);
      }
    } catch (err) {
      console.error("Failed to complete booking:", err);
      alert("Unable to mark booking complete. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const saveBookingNote = async (bookingId) => {
    const note = (noteInputs[bookingId] || "").trim();
    if (!note) {
      alert("Please enter the work update before saving.");
      return;
    }

    try {
      setSavingNoteId(bookingId);
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/notes`,
        { note },
        axiosConfig
      );
      setBookings((prev) =>
        prev.map((booking) => (booking.id === bookingId ? res.data : booking))
      );
      setNoteInputs((prev) => ({ ...prev, [bookingId]: "" }));
    } catch (err) {
      console.error("Failed to save booking note:", err);
      alert("Unable to save the work note. Please try again.");
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleNoteChange = (bookingId, value) => {
    setNoteInputs((prev) => ({ ...prev, [bookingId]: value }));
  };

  const getStatus = (status) => {
    const cfg = {
      PENDING: { bg: "bg-amber-50", text: "text-amber-700", icon: FaHourglassHalf },
      CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", icon: FaCheckCircle },
      COMPLETED: { bg: "bg-slate-100", text: "text-slate-800", icon: FaCheckCircle },
      CANCELLED: { bg: "bg-red-50", text: "text-red-700", icon: FaTimesCircle },
    };

    const c = cfg[status] || cfg.PENDING;
    const Icon = c.icon;
    const labelMap = { PENDING: "Pending", CONFIRMED: "Accepted", COMPLETED: "Completed", CANCELLED: "Declined" };

    return (
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${c.bg} ${c.text}`}>
        <Icon size={10} /> {labelMap[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <p className="text-center py-10 text-slate-400 text-sm">
        Loading bookings...
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* FILTER BAR */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500">Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 rounded-md border border-slate-200 bg-white text-sm"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Accepted</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Declined</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">{filtered.length} bookings</span>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No bookings found
        </div>
      ) : (
        filtered.map((b) => (
          <div
            key={b.id}
            className="bg-gradient-to-r from-white to-blue-50/40 border border-blue-100/50 rounded-3xl px-5 py-5 hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg">
                  {(userType === "caregiver" ? b.userName : b.caregiverName)
                    ?.split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {userType === "caregiver" ? b.userName : b.caregiverName}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{b.serviceType}</p>
                  <p className="text-xs text-slate-400 mt-1">Booking ID: {b.id}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-start xl:items-end text-left xl:text-right">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Request date</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    {b.createdAt?.split("T")[0] || b.startTime?.split(" ")[0]}
                  </p>
                </div>
                <div>{getStatus(b.status)}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">Start</p>
                <p className="font-semibold text-slate-900">{b.startTime?.split(" ")[0]}</p>
                <p className="text-xs text-slate-500 mt-1">{b.startTime?.split(" ")[1]}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">End</p>
                {b.status === "COMPLETED" ? (
                  <>
                    <p className="font-semibold text-slate-900">{b.endTime?.split(" ")[0] || "—"}</p>
                    <p className="text-xs text-slate-500 mt-1">{b.endTime?.split(" ")[1] || "—"}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-slate-900">Pending</p>
                    <p className="text-xs text-slate-500 mt-1">Complete first</p>
                  </>
                )}
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">Rate</p>
                <p className="font-semibold text-slate-900">Rs {b.hourlyRate}/hr</p>
                {b.location && (
                  <p className="text-xs text-slate-500 mt-1 truncate">{b.location}</p>
                )}
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">Client</p>
                {userType === "caregiver" ? (
                  <>
                    <p className="font-semibold text-slate-900">{b.userName}</p>
                    <p className="text-xs text-slate-500 mt-1">{b.userPhone || "No phone"}</p>
                  </>
                ) : (
                  <p className="font-semibold text-slate-900">{b.caregiverName}</p>
                )}
              </div>
            </div>

            {b.notes && (
              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">Notes</p>
                <p>{b.notes}</p>
              </div>
            )}

            {(b.status === "CONFIRMED" || b.status === "COMPLETED") && (
              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 mb-2">Daily care log</p>
                {Array.isArray(b.dailyNotes) && b.dailyNotes.length > 0 ? (
                  <ul className="space-y-2">
                    {b.dailyNotes.map((entry, index) => (
                      <li key={index} className="rounded-2xl bg-white p-3 border border-slate-200 text-slate-700">
                        {entry}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">No daily work log has been added yet.</p>
                )}
                {userType === "caregiver" && b.status === "CONFIRMED" && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      rows={3}
                      value={noteInputs[b.id] || ""}
                      onChange={(e) => handleNoteChange(b.id, e.target.value)}
                      placeholder="Write what work you completed today..."
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                      type="button"
                      disabled={savingNoteId === b.id}
                      onClick={() => saveBookingNote(b.id)}
                      className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 transition"
                    >
                      {savingNoteId === b.id ? "Saving..." : "Save work log"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {userType === "caregiver" && b.status === "PENDING" && (
              <div className="relative mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setOpenBookingMenu((prev) => (prev === b.id ? null : b.id))}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  Update status
                  <FaChevronDown size={12} />
                </button>
                {openBookingMenu === b.id && (
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateBookingStatus(b.id, "CONFIRMED")}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Accept booking
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Decline booking
                    </button>
                  </div>
                )}
              </div>
            )}
            {userType === "caregiver" && b.status === "CONFIRMED" && (
              <div className="relative mt-5 text-right">
                <button
                  type="button"
                  onClick={() => setOpenBookingMenu((prev) => (prev === b.id ? null : b.id))}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  Booking actions
                  <FaChevronDown size={12} />
                </button>
                {openBookingMenu === b.id && (
                  <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => completeBooking(b.id)}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Mark complete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default BookingsList;