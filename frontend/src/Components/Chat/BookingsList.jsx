import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";

const BookingsList = ({ userType, userId: propUserId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const localUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");

  // Use prop userId if provided, otherwise fall back to localStorage
  const userId = propUserId || localUserId;

  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Filter options
  const filterOptions = [
    { value: "ALL", label: "All Bookings" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Accepted" },
    { value: "CANCELLED", label: "Declined" },
  ];

  // Filter bookings based on selected status
  const filteredBookings = bookings.filter((booking) => {
    if (statusFilter === "ALL") return true;
    return booking.status === statusFilter;
  });

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = "";
      if (userType === "caregiver") {
        url = `http://localhost:8080/api/bookings/caregiver/${userId}`;
      } else {
        url = `http://localhost:8080/api/bookings/user/${userId}`;
      }
      const res = await axios.get(url, axiosConfig);
      setBookings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      setActionLoading(bookingId);
      await axios.put(
        `http://localhost:8080/api/bookings/${bookingId}/confirm`,
        {},
        axiosConfig
      );
      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      console.error("Failed to confirm booking:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = window.prompt("Please enter the rejection reason:");
    if (reason === null) return;
    if (!reason.trim()) {
      window.alert("Rejection reason is required.");
      return;
    }

    try {
      setActionLoading(bookingId);
      await axios.put(
        `http://localhost:8080/api/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason.trim())}`,
        {},
        axiosConfig
      );
      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: FaHourglassHalf },
      CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: FaCheckCircle },
      CANCELLED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: FaTimesCircle },
      COMPLETED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: FaCheckCircle },
    };
    const cfg = config[status] || config.PENDING;
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        <Icon size={10} /> {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading bookings...</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <FaCalendarAlt size={20} className="text-gray-300" />
        </div>
        <p className="text-[13.5px] font-semibold text-gray-500">
          {userType === "caregiver" ? "No booking requests yet" : "No bookings yet"}
        </p>
        <p className="text-[12px] text-gray-400 text-center max-w-xs">
          {userType === "caregiver"
            ? "When care receivers request bookings, they will appear here."
            : "Your booking requests will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter Dropdown */}
      <div className="flex items-center justify-between mb-2">
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <FaFilter size={12} className="text-gray-500" />
            <span className="text-[13px] font-medium text-gray-700">
              {statusFilter === "ALL" ? "All Bookings" : statusFilter === "PENDING" ? "Pending" : statusFilter === "CONFIRMED" ? "Accepted" : "Declined"}
            </span>
            <FaChevronDown size={10} className="text-gray-400" />
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 transition-colors ${
                    statusFilter === option.value ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="text-[12px] text-gray-500">
          {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <FaCalendarAlt size={20} className="text-gray-300" />
          </div>
          <p className="text-[13.5px] font-semibold text-gray-500">No bookings found</p>
          <p className="text-[12px] text-gray-400 text-center max-w-xs">
            No bookings match the selected filter.
          </p>
        </div>
      ) : (
        filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with status */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">
                  {userType === "caregiver" ? booking.userName : booking.caregiverName}
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{booking.serviceType}</p>
              </div>
              {getStatusBadge(booking.status)}
            </div>

            {/* Grid of details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="flex items-start gap-2">
                <FaCalendarAlt size={12} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10.5px] text-gray-400 font-medium uppercase">Date</p>
                  <p className="text-[12px] font-semibold text-gray-700 truncate">{booking.startTime?.split(" ")[0]}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <FaClock size={12} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10.5px] text-gray-400 font-medium uppercase">Time</p>
                  <p className="text-[12px] font-semibold text-gray-700">{booking.startTime?.split(" ")[1]} - {booking.endTime?.split(" ")[1]}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[10.5px] text-gray-400 font-medium uppercase block">Rate</span>
                <p className="text-[12px] font-bold text-gray-900">Rs {booking.hourlyRate}/hr</p>
              </div>

              {booking.location && (
                <div className="flex items-start gap-2 col-span-2 sm:col-span-1">
                  <FaMapMarkerAlt size={12} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10.5px] text-gray-400 font-medium uppercase">Location</p>
                    <p className="text-[12px] font-semibold text-gray-700 truncate">{booking.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Care receiver contact (if caregiver view) */}
            {userType === "caregiver" && (
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {booking.userName?.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-gray-900">{booking.userName}</p>
                  {booking.userPhone && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                      <FaPhone size={9} /> {booking.userPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="mb-5 pb-5 border-b border-gray-100">
                <p className="text-[10.5px] text-gray-400 font-medium uppercase mb-1.5">Additional notes</p>
                <p className="text-[12px] text-gray-700 bg-gray-50 rounded-lg p-3">{booking.notes}</p>
              </div>
            )}

            {/* Actions */}
            {userType === "caregiver" && booking.status === "PENDING" && (
              <div className="flex gap-3 sm:justify-end">
                <button
                  onClick={() => handleCancelBooking(booking.id)}
                  disabled={actionLoading === booking.id}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-[12px] font-bold hover:bg-red-50 transition-all disabled:opacity-50"
                >
                  {actionLoading === booking.id ? "Declining..." : "Decline"}
                </button>
                <button
                  onClick={() => handleConfirmBooking(booking.id)}
                  disabled={actionLoading === booking.id}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-[12px] font-bold hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  {actionLoading === booking.id ? "Accepting..." : "Accept"}
                </button>
              </div>
            )}

            {userType === "caregiver" && booking.status === "CONFIRMED" && (
              <div className="text-center text-[12px] text-emerald-600 font-semibold">
                ✓ You accepted this booking
              </div>
            )}

            {userType === "caregiver" && booking.status === "CANCELLED" && (
              <div className="text-center text-[12px] text-red-600 font-semibold">
                ✕ You declined this booking
              </div>
            )}
          </div>
        ))
      )}
</div>
);
};

export default BookingsList;