"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

/*
  =====================================================
  INVITED GUEST LIST
  =====================================================

  Add your invited names here.

  Each name automatically has 2 seats reserved.

  Example:
  "John Doe",
  "Maria Santos",

  You can add as many names as you need.
*/

const invitedGuests = [
  "John Doe",
  "Jane Smith",
  "Michael Santos",
  "Sarah Garcia",
];

export default function Home() {
  /* -------------------------------------------------
     OPENING INVITATION
  ------------------------------------------------- */

  const [opened, setOpened] = useState(false);

  /* -------------------------------------------------
     INVITATION SEARCH
  ------------------------------------------------- */

  const [searchName, setSearchName] = useState("");
  const [invitationFound, setInvitationFound] = useState(false);
  const [invitationError, setInvitationError] = useState("");
  const [matchedGuest, setMatchedGuest] = useState("");

  /* -------------------------------------------------
     RSVP
  ------------------------------------------------- */

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState("attending");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------------------------------
     FIND INVITATION
  ------------------------------------------------- */

  function findInvitation() {
    const search = searchName.trim().toLowerCase();

    setInvitationError("");
    setInvitationFound(false);
    setMatchedGuest("");

    if (!search) {
      setInvitationError("Please enter your name.");
      return;
    }

    const foundGuest = invitedGuests.find(
      (name) => name.toLowerCase() === search
    );

    if (!foundGuest) {
      setInvitationError(
        "We couldn't find an invitation under that name. Please check the spelling or contact the couple."
      );
      return;
    }

    setInvitationFound(true);
    setMatchedGuest(foundGuest);
    setGuestName(foundGuest);
    setGuests("1");
  }

  /* -------------------------------------------------
     RSVP SUBMISSION
  ------------------------------------------------- */

  async function submitRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    if (!invitationFound) {
      setStatus("Please find your invitation first.");
      setLoading(false);
      return;
    }

    if (Number(guests) > 2) {
      setStatus("Your invitation is limited to 2 seats.");
      setGuests("2");
      setLoading(false);
      return;
    }

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

  /* -------------------------------------------------
     GOOGLE CALENDAR
  ------------------------------------------------- */

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

  /* -------------------------------------------------
     DOWNLOAD CALENDAR
  ------------------------------------------------- */

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

  /* =================================================
     OPENING INVITATION
  ================================================= */

  if (!opened) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] flex items-center justify-center px-6 relative overflow-hidden">

        {/* Decorative background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#eadfd2] opacity-40 blur-3xl" />

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

            <span className="text-[#9a7654] text-lg">
              ♡
            </span>

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

  /* =================================================
     RSVP PAGE
  ================================================= */

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16">

      <div className="max-w-3xl mx-auto">

        {/* -------------------------------------------------
           HEADER
        ------------------------------------------------- */}

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

        {/* =================================================
           FIND YOUR INVITATION
        ================================================= */}

        {!invitationFound && (
          <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm mb-14">

            <div className="text-center">

              <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654] mb-4">
                Your Invitation
              </p>

              <h2 className="font-serif text-3xl md:text-4xl">
                Find Your Invitation
              </h2>

              <p className="mt-4 text-sm text-[#756d63] max-w-md mx-auto">
                Please enter your full name exactly as it appears on your
                invitation.
              </p>

            </div>

            <div className="mt-8">

              <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                Your Name
              </label>

              <input
                type="text"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setInvitationError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    findInvitation();
                  }
                }}
                placeholder="Enter your full name"
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none focus:border-[#9a7654]"
              />

            </div>

            {invitationError && (
              <div className="mt-5 text-center text-sm text-red-600">
                {invitationError}
              </div>
            )}

            <button
              type="button"
              onClick={findInvitation}
              className="w-full mt-8 bg-[#29251f] text-white rounded-full py-5 tracking-[0.25em] uppercase text-sm hover:bg-[#3b352e] transition"
            >
              Find My Invitation
            </button>

          </section>
        )}

        {/* =================================================
           INVITATION FOUND
        ================================================= */}

        {invitationFound && (
          <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm mb-14 text-center">

            <div className="text-4xl mb-4">
              ♡
            </div>

            <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654] mb-4">
              Invitation Found
            </p>

            <h2 className="font-serif text-3xl md:text-4xl text-[#9a7654]">
              Welcome, {matchedGuest}
            </h2>

            <p className="mt-4 text-[#756d63]">
              We are delighted to celebrate this special day with you.
            </p>

            <div className="mt-6 inline-block rounded-2xl bg-[#f8f5ef] px-8 py-5">

              <p className="text-xs tracking-[0.25em] uppercase text-[#8a8177]">
                Seats Reserved
              </p>

              <p className="font-serif text-4xl text-[#9a7654] mt-2">
                2
              </p>

              <p className="text-sm text-[#756d63] mt-1">
                seats reserved for your invitation
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                setInvitationFound(false);
                setMatchedGuest("");
                setGuestName("");
                setSearchName("");
                setInvitationError("");
              }}
              className="block mx-auto mt-6 text-xs tracking-[0.15em] uppercase text-[#9a7654] underline underline-offset-4"
            >
              Search another name
            </button>

          </section>
        )}

        {/* =================================================
           EVENT INFORMATION
        ================================================= */}

        <section className="text-center mb-14">

          {/* Couple Name */}
          <h2 className="font-serif text-4xl md:text-5xl tracking-wide text-[#9a7654] leading-tight">
            Nezeal Ven & Shintal Khye
          </h2>

          <p className="font-serif text-2xl md:text-3xl mt-3">
            Are getting married
          </p>

          <div className="mt-6 space-y-2 text-[#756d63]">

            <p>
              April 23, 2026 · 4:00 PM
            </p>

            <p>
              E&J Grand Pavilion
            </p>

            <p>
              DC, Bukidnon
            </p>

            <p>
              Formal · Semi Formal
            </p>

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

        {/* =================================================
           RSVP FORM
        ================================================= */}

        {invitationFound && (
          <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm">

            <div className="text-center mb-8">

              <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654] mb-3">
                RSVP
              </p>

              <h2 className="font-serif text-3xl md:text-4xl">
                Please Respond
              </h2>

              <p className="mt-3 text-sm text-[#756d63]">
                Your invitation includes a maximum of 2 seats.
              </p>

            </div>

            <form
              onSubmit={submitRSVP}
              className="space-y-7"
            >

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
                    Number of Guests
                  </label>

                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none"
                  >

                    <option value="1">
                      1 Guest
                    </option>

                    <option value="2">
                      2 Guests
                    </option>

                  </select>

                </div>

              </div>

              {/* Reserved Seats Notice */}
              <div className="rounded-2xl bg-[#f8f5ef] p-5 text-center">

                <p className="text-xs tracking-[0.2em] uppercase text-[#9a7654]">
                  Your Invitation
                </p>

                <p className="font-serif text-xl mt-2">
                  2 seats reserved
                </p>

                <p className="text-xs text-[#8a8177] mt-1">
                  Please do not exceed your reserved seats.
                </p>

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
        )}

        {/* =================================================
           FOOTER
        ================================================= */}

        <footer className="text-center mt-12 text-sm text-[#8a8177]">

          <p>
            We can't wait to celebrate with you. ❤️
          </p>

        </footer>

      </div>
    </main>
  );
}
