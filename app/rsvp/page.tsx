"use client";

import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Heart,
  MapPin,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RSVPPage() {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<
    "attending" | "not_attending" | ""
  >("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function updateGuestCount(count: number) {
    const safeCount = Math.min(10, Math.max(1, count));

    setGuestCount(safeCount);

    const additionalCount = safeCount - 1;

    setGuestNames((current) => {
      const updated = [...current];

      while (updated.length < additionalCount) {
        updated.push("");
      }

      return updated.slice(0, additionalCount);
    });
  }

  function updateGuestName(index: number, value: string) {
    setGuestNames((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  function selectAttendance(
    value: "attending" | "not_attending"
  ) {
    setAttendance(value);

    if (value === "not_attending") {
      setGuestCount(1);
      setGuestNames([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!attendance) {
      setError("Please select whether you are attending.");
      return;
    }

    if (attendance === "attending") {
      const emptyGuest = guestNames.some(
        (guest) => !guest.trim()
      );

      if (emptyGuest) {
        setError("Please enter the name of every additional guest.");
        return;
      }
    }

    setSubmitting(true);

    const additionalGuests =
      attendance === "attending"
        ? guestNames
            .map((guest) => guest.trim())
            .filter(Boolean)
        : [];

    const { error: insertError } = await supabase
      .from("rsvps")
      .insert({
        guest_name: name.trim(),
        attendance,
        guest_count:
          attendance === "attending" ? guestCount : 0,
        additional_guests: additionalGuests,
        message: message.trim() || null,
      });

    setSubmitting(false);

    if (insertError) {
      console.error("RSVP ERROR:", insertError);

      setError(`RSVP Error: ${insertError.message}`);
      return;
    }

    setSubmitted(true);
  }

  function addToGoogleCalendar() {
    const start = "20260423T160000";
    const end = "20260423T190000";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" +
      encodeURIComponent(
        "Nezeal Ven & Shintal Khye Wedding"
      ) +
      "&dates=" +
      start +
      "/" +
      end +
      "&details=" +
      encodeURIComponent(
        "We are getting married! We would love to celebrate this special day with you."
      ) +
      "&location=" +
      encodeURIComponent(
        "E&J Grand Pavilion, DC, Bukidnon"
      );

    window.open(url, "_blank");
  }

  function downloadCalendar() {
    const calendar =
      `BEGIN:VCALENDAR\r\n` +
      `VERSION:2.0\r\n` +
      `PRODID:-//Nezeal Ven & Shintal Khye//Wedding//EN\r\n` +
      `BEGIN:VEVENT\r\n` +
      `DTSTART:20260423T160000\r\n` +
      `DTEND:20260423T190000\r\n` +
      `SUMMARY:Nezeal Ven & Shintal Khye Wedding\r\n` +
      `LOCATION:E&J Grand Pavilion, DC, Bukidnon\r\n` +
      `DESCRIPTION:We are getting married! We would love to celebrate this special day with you.\r\n` +
      `BEGIN:VALARM\r\n` +
      `TRIGGER:-P1D\r\n` +
      `ACTION:DISPLAY\r\n` +
      `DESCRIPTION:Wedding tomorrow - Nezeal Ven & Shintal Khye\r\n` +
      `END:VALARM\r\n` +
      `END:VEVENT\r\n` +
      `END:VCALENDAR`;

    const blob = new Blob([calendar], {
      type: "text/calendar",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "nezeal-shintal-wedding.ics";
    link.click();

    URL.revokeObjectURL(url);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#3d3a35] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <Heart
              className="mx-auto mb-5 text-[#9b8d7b]"
              size={32}
              strokeWidth={1.4}
            />

            <p className="text-xs uppercase tracking-[0.3em] text-[#817669] mb-4">
              RSVP
            </p>

            <h1 className="font-serif text-4xl md:text-5xl">
              Thank You
            </h1>

            <p className="mt-5 text-[#777067] leading-relaxed">
              Your RSVP has been received.
              <br />
              We are so happy to celebrate with you!
            </p>
          </div>

          <div className="bg-white/60 border border-[#ded6ca] rounded-[2rem] p-7 md:p-9 shadow-sm">
            <div className="text-center">
              <p className="font-serif text-3xl md:text-4xl text-[#4b4741]">
                Nezeal Ven
              </p>

              <p className="my-2 text-[#9b8d7b] text-lg">
                &
              </p>

              <p className="font-serif text-3xl md:text-4xl text-[#4b4741]">
                Shintal Khye
              </p>

              <div className="mt-7 pt-6 border-t border-[#ded6ca] space-y-3 text-sm text-[#777067]">
                <div className="flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  <span>April 23, 2026</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Clock size={16} />
                  <span>4:00 PM</span>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <MapPin size={16} />
                  <span>E&J Grand Pavilion, DC, Bukidnon</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={addToGoogleCalendar}
              className="w-full rounded-full bg-[#4b4741] text-white py-4 px-6 text-sm tracking-wide hover:bg-[#35322e] transition flex items-center justify-center gap-2"
            >
              <Calendar size={17} />
              Add to Google Calendar
            </button>

            <button
              type="button"
              onClick={downloadCalendar}
              className="w-full rounded-full border border-[#cfc5b8] text-[#4b4741] py-4 px-6 text-sm tracking-wide hover:bg-white transition flex items-center justify-center gap-2"
            >
              <Calendar size={17} />
              Download Calendar (.ics)
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#3d3a35] px-5 py-8 md:py-12">
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-1 text-sm text-[#777067] hover:text-[#3d3a35] transition mb-10"
        >
          <ChevronLeft size={17} />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-9">
          <Heart
            className="mx-auto mb-5 text-[#9b8d7b]"
            size={30}
            strokeWidth={1.4}
          />

          <p className="text-xs uppercase tracking-[0.3em] text-[#817669] mb-4">
            RSVP
          </p>

          <h1 className="font-serif text-4xl md:text-5xl">
            Nezeal Ven & Shintal Khye
          </h1>

          <p className="mt-4 text-sm text-[#777067]">
            We would love to celebrate this special day with you.
          </p>
        </div>

        {/* Wedding Information */}
        <div className="bg-white/50 border border-[#ded6ca] rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-[#777067]">
            <div className="flex flex-col items-center gap-2">
              <Calendar
                size={18}
                className="text-[#9b8d7b]"
              />
              <span>April 23, 2026</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Clock
                size={18}
                className="text-[#9b8d7b]"
              />
              <span>4:00 PM</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <MapPin
                size={18}
                className="text-[#9b8d7b]"
              />
              <span>E&J Grand Pavilion</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/60 border border-[#ded6ca] rounded-[2rem] p-6 md:p-9 shadow-sm"
        >
          {/* Name */}
          <div className="mb-7">
            <label className="block text-sm text-[#4b4741] mb-2">
              Your Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-full border border-[#d8d0c5] bg-[#fdfbf8] px-5 py-3.5 text-sm outline-none focus:border-[#9b8d7b]"
            />
          </div>

          {/* Attendance */}
          <div className="mb-7">
            <label className="block text-sm text-[#4b4741] mb-3">
              Will you be attending?
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  selectAttendance("attending")
                }
                className={`rounded-full border py-3.5 text-sm transition ${
                  attendance === "attending"
                    ? "bg-[#4b4741] text-white border-[#4b4741]"
                    : "bg-[#fdfbf8] text-[#4b4741] border-[#d8d0c5] hover:border-[#9b8d7b]"
                }`}
              >
                Joyfully Accept
              </button>

              <button
                type="button"
                onClick={() =>
                  selectAttendance("not_attending")
                }
                className={`rounded-full border py-3.5 text-sm transition ${
                  attendance === "not_attending"
                    ? "bg-[#4b4741] text-white border-[#4b4741]"
                    : "bg-[#fdfbf8] text-[#4b4741] border-[#d8d0c5] hover:border-[#9b8d7b]"
                }`}
              >
                Regretfully Decline
              </button>
            </div>
          </div>

          {/* Guest Count */}
          {attendance === "attending" && (
            <div className="mb-7">
              <label className="flex items-center gap-2 text-sm text-[#4b4741] mb-2">
                <Users size={16} />
                Number of Guests
              </label>

              <select
                value={guestCount}
                onChange={(e) =>
                  updateGuestCount(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-full border border-[#d8d0c5] bg-[#fdfbf8] px-5 py-3.5 text-sm outline-none focus:border-[#9b8d7b]"
              >
                {Array.from(
                  { length: 10 },
                  (_, index) => index + 1
                ).map((number) => (
                  <option
                    key={number}
                    value={number}
                  >
                    {number}{" "}
                    {number === 1
                      ? "Guest"
                      : "Guests"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Additional Guests */}
          {attendance === "attending" &&
            guestCount > 1 && (
              <div className="mb-7">
                <label className="block text-sm text-[#4b4741] mb-3">
                  Additional Guest Names
                </label>

                <div className="space-y-3">
                  {guestNames.map(
                    (guestName, index) => (
                      <input
                        key={index}
                        type="text"
                        value={guestName}
                        onChange={(e) =>
                          updateGuestName(
                            index,
                            e.target.value
                          )
                        }
                        placeholder={`Guest ${
                          index + 2
                        } full name`}
                        className="w-full rounded-full border border-[#d8d0c5] bg-[#fdfbf8] px-5 py-3.5 text-sm outline-none focus:border-[#9b8d7b]"
                      />
                    )
                  )}
                </div>
              </div>
            )}

          {/* Message */}
          <div className="mb-7">
            <label className="block text-sm text-[#4b4741] mb-2">
              Message to the Couple
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Leave us a message..."
              rows={4}
              className="w-full rounded-2xl border border-[#d8d0c5] bg-[#fdfbf8] px-5 py-4 text-sm outline-none resize-none focus:border-[#9b8d7b]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-2xl border border-[#d8c8bd] bg-[#faf4ef] px-5 py-4 text-sm text-[#7b5f50]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#4b4741] text-white py-4 px-6 text-sm tracking-wide hover:bg-[#35322e] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Submitting RSVP..."
              : "Submit RSVP"}
          </button>
        </form>

        {/* Deadline */}
        <p className="text-center text-xs text-[#817669] mt-6">
          Kindly RSVP by April 5, 2026
        </p>
      </div>
    </main>
  );
}
