"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [opened, setOpened] = useState(false);

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState("attending");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    if (!supabase) {
      setStatus("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("rsvps").insert({
      guest_name: guestName,
      email: email,
      attendance: attendance,
      guests: Number(guests),
      message: message || null,
    });

    if (error) {
      console.error(error);
      setStatus(`Unable to send RSVP: ${error.message}`);
      setLoading(false);
      return;
    }

    setStatus("Thank you! Your RSVP has been received. ❤️");

    setGuestName("");
    setEmail("");
    setAttendance("attending");
    setGuests("1");
    setMessage("");

    setLoading(false);
  }

  function addToGoogleCalendar() {
    const title = "Nezeal Ven & Shintal Khye Wedding";
    const details =
      "We are getting married! Dress code: Formal · Semi Formal";
    const location = "E&J Grand Pavilion, DC, Bukidnon";

    const start = "20260423T160000";
    const end = "20260423T190000";

    const url =
      "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(title)}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent(details)}` +
      `&location=${encodeURIComponent(location)}`;

    window.open(url, "_blank");
  }

  function downloadCalendarFile() {
    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nezeal and Shintal Wedding//EN
BEGIN:VEVENT
UID:nezeal-shintal-wedding@example.com
DTSTAMP:20260906T000000Z
DTSTART:20260423T160000
DTEND:20260423T190000
SUMMARY:Nezeal Ven & Shintal Khye Wedding
DESCRIPTION:We are getting married! Dress code: Formal · Semi Formal
LOCATION:E&J Grand Pavilion, DC, Bukidnon
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], {
      type: "text/calendar;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "nezeal-shintal-wedding.ics";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /* -------------------------------------------------
     OPENING INVITATION
  ------------------------------------------------- */

  if (!opened) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] flex items-center justify-center px-6 relative overflow-hidden">
        
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#eadfD2] opacity-40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#e4d4c2] opacity-40 blur-3xl" />

        <div className="relative z-10 text-center max-w-xl">

          <p className="text-xs tracking-[0.45em] uppercase text-[#9a7654] mb-8 animate-pulse">
            Together with their families
          </p>

          <p className="font-serif text-lg md:text-xl text-[#756d63] mb-5">
            We joyfully invite you to celebrate the wedding of
          </p>

          <h1 className="font-serif text-5xl md:text-7xl leading-tight text-[#9a7654] tracking-wide">
            Nezeal Ven
          </h1>

          <p className="font-serif text-3xl md:text-4xl my-3 text-[#756d63]">
            &
          </p>

          <h1 className="font-serif text-5xl md:text-7xl leading-tight text-[#9a7654] tracking-wide">
            Shintal Khye
          </h1>

          <div className="my-8 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-[#c9b49e]" />
            <span className="text-[#9a7654] text-lg">♡</span>
            <div className="h-px w-16 bg-[#c9b49e]" />
          </div>

          <p className="font-serif text-2xl md:text-3xl">
            Are getting married
          </p>

          <p className="mt-5 text-sm tracking-[0.2em] uppercase text-[#756d63]">
            April 23, 2026 · 4:00 PM
          </p>

          <button
            type="button"
            onClick={() => setOpened(true)}
            className="mt-12 rounded-full border border-[#9a7654] px-10 py-4 text-xs tracking-[0.3em] uppercase text-[#9a7654] hover:bg-[#9a7654] hover:text-white transition-all duration-500"
          >
            Open Invitation
          </button>

          <p className="mt-5 text-xs text-[#8a8177]">
            We would love to celebrate this special day with you.
          </p>

        </div>
      </main>
    );
  }

  /* -------------------------------------------------
     RSVP PAGE
  ------------------------------------------------- */

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <section className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-[#9a7654] mb-5">
            Kindly Respond
          </p>

          <h1 className="text-5xl md:text-6xl font-serif leading-tight">
            Will you celebrate with us?
          </h1>

          <p className="mt-5 text-[#756d63]">
            Please RSVP by April 5, 2026.
          </p>
        </section>

        {/* Event Information */}
        <section className="text-center mb-14">

          {/* Couple Name */}
          <h2 className="font-serif text-4xl md:text-5xl tracking-wide text-[#9a7654] leading-tight">
            Nezeal Ven & Shintal Khye
          </h2>

          <p className="font-serif text-2xl md:text-3xl mt-3">
            Are getting married
          </p>

          <div className="mt-6 space-y-2 text-[#756d63]">
            <p>April 23, 2026 · 4:00 PM</p>
            <p>E&J Grand Pavilion</p>
            <p>DC, Bukidnon</p>
            <p>Formal · Semi Formal</p>
          </div>

          {/* Calendar Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">

            <button
              type="button"
              onClick={addToGoogleCalendar}
              className="bg-[#29251f] text-white rounded-full px-6 py-3 text-sm tracking-[0.12em] uppercase hover:bg-[#3b352e] transition"
            >
              Add to Google Calendar
            </button>

            <button
              type="button"
              onClick={downloadCalendarFile}
              className="border border-[#29251f] text-[#29251f] rounded-full px-6 py-3 text-sm tracking-[0.12em] uppercase hover:bg-white transition"
            >
              Download Calendar
            </button>

          </div>

          <p className="text-xs text-[#8a8177] mt-4">
            Save the date so your calendar can remind you when it's time to
            celebrate. ❤️
          </p>

        </section>

        {/* RSVP Form */}
        <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm">

          <form onSubmit={submitRSVP} className="space-y-7">

            {/* Name */}
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                Your Name
              </label>

              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="Your full name"
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none focus:border-[#29251f]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none focus:border-[#29251f]"
              />
            </div>

            {/* Attendance + Guests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

              {/* Attendance */}
              <div>
                <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                  Attendance
                </label>

                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none"
                >
                  <option value="attending">
                    Joyfully attending
                  </option>

                  <option value="declining">
                    Regretfully declining
                  </option>
                </select>
              </div>

              {/* Guests */}
              <div>
                <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                  Guests
                </label>

                <input
                  type="number"
                  min="1"
                  max="10"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  required
                  className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none"
                />
              </div>

            </div>

            {/* Message */}
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                Message (Optional)
              </label>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="A little note for the couple..."
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none resize-none"
              />
            </div>

            {/* Status */}
            {status && (
              <div
                className={`text-center text-sm ${
                  status.includes("Thank you")
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {status}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#29251f] text-white rounded-full py-5 tracking-[0.25em] uppercase text-sm hover:bg-[#3b352e] transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send RSVP"}
            </button>

          </form>
        </section>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-[#8a8177]">
          <p>
            We can't wait to celebrate with you. ❤️
          </p>
        </footer>

      </div>
    </main>
  );
}
