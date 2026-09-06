"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

type Step =
  | "landing"
  | "search"
  | "found"
  | "rsvp"
  | "walkin"
  | "success";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");

  // Invitation search
  const [searchName, setSearchName] = useState("");
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Invitation information
  const [invitedName, setInvitedName] = useState("");
  const [seatsReserved, setSeatsReserved] = useState(0);

  // RSVP form
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState("attending");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");

  // Status
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  /*
   * OPEN INVITATION
   */
  function openInvitation() {
    setStep("search");
    setStatus("");
    setNotFound(false);
  }

  /*
   * SEARCH INVITATION
   */
  async function searchInvitation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = searchName.trim();

    if (!name) {
      setStatus("Please enter your full name.");
      return;
    }

    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }

    setSearching(true);
    setStatus("");
    setNotFound(false);

    const { data, error } = await supabase
      .from("invited_guests")
      .select("full_name, seats_reserved")
      .ilike("full_name", name)
      .maybeSingle();

    if (error) {
      console.error(error);

      setStatus(
        "We couldn't check your invitation right now. Please try again."
      );

      setSearching(false);
      return;
    }

    if (!data) {
      setNotFound(true);
      setSearching(false);
      return;
    }

    // Invitation found
    setInvitedName(data.full_name);
    setSeatsReserved(Number(data.seats_reserved) || 1);

    // Put the invitation name into the RSVP form
    setGuestName(data.full_name);

    setSearching(false);
    setStep("found");
  }

  /*
   * CONTINUE FROM INVITATION DETAILS
   */
  function continueToRSVP() {
    setStep("rsvp");
    setStatus("");

    // Default guests to the invitation amount,
    // but don't allow more than 2 in the dropdown.
    const defaultGuests = Math.min(seatsReserved, 2);

    setGuests(String(defaultGuests));
  }

  /*
   * GO TO WALK-IN RSVP
   */
  function continueAsWalkIn() {
    setStep("walkin");
    setStatus("");

    // Keep the name they searched for
    setGuestName(searchName.trim());
  }

  /*
   * SUBMIT RSVP
   */
  async function submitRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!supabase) {
      setStatus("Supabase is not configured.");
      return;
    }

    const name = guestName.trim();
    const numberOfGuests = Number(guests);

    if (!name) {
      setStatus("Please enter your full name.");
      return;
    }

    setLoading(true);
    setStatus("");

    /*
     * INVITED GUEST RSVP
     */
    if (step === "rsvp") {
      if (numberOfGuests > seatsReserved) {
        setStatus(
          `Your invitation is reserved for ${seatsReserved} ${
            seatsReserved === 1 ? "guest" : "guests"
          }.`
        );

        setGuests(String(Math.min(seatsReserved, 2)));
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("rsvps").insert({
        guest_name: invitedName,
        email: email.trim(),
        attendance,
        guests: numberOfGuests,
        message: message.trim() || null,
      });

      if (error) {
        console.error(error);

        setStatus(`Unable to send RSVP: ${error.message}`);
        setLoading(false);
        return;
      }

      setStep("success");
      setLoading(false);
      return;
    }

    /*
     * WALK-IN RSVP
     */
    if (step === "walkin") {
      if (numberOfGuests > 2) {
        setStatus("Walk-In RSVPs are limited to 2 guests.");
        setGuests("2");
        setLoading(false);
        return;
      }

      const walkInMessage = `[WALK-IN RSVP]${
        message.trim() ? ` ${message.trim()}` : ""
      }`;

      const { error } = await supabase.from("rsvps").insert({
        guest_name: name,
        email: email.trim(),
        attendance,
        guests: numberOfGuests,
        message: walkInMessage,
      });

      if (error) {
        console.error(error);

        setStatus(`Unable to send RSVP: ${error.message}`);
        setLoading(false);
        return;
      }

      setStep("success");
      setLoading(false);
    }
  }

  /*
   * START AGAIN
   */
  function startAgain() {
    setStep("landing");

    setSearchName("");
    setGuestName("");
    setEmail("");
    setAttendance("attending");
    setGuests("1");
    setMessage("");

    setInvitedName("");
    setSeatsReserved(0);

    setNotFound(false);
    setStatus("");
  }

  /*
   * GOOGLE CALENDAR
   */
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

  /*
   * DOWNLOAD CALENDAR
   */
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

  /*
   * ==========================================
   * LANDING PAGE
   * ==========================================
   */
  if (step === "landing") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] flex items-center justify-center px-6 relative overflow-hidden">

        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#eadfd2] opacity-50 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#e4d4c2] opacity-50 blur-3xl" />

        <div className="relative z-10 text-center max-w-2xl">

          <p className="text-xs tracking-[0.45em] uppercase text-[#9a7654] mb-8">
            Together with their families
          </p>

          <p className="font-serif text-lg md:text-xl text-[#756d63] mb-6">
            We joyfully invite you to celebrate
          </p>

          <h1 className="font-serif text-5xl md:text-7xl text-[#9a7654] tracking-wide">
            Nezeal Ven
          </h1>

          <p className="font-serif text-3xl md:text-4xl my-3 text-[#756d63]">
            &
          </p>

          <h1 className="font-serif text-5xl md:text-7xl text-[#9a7654] tracking-wide">
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
            onClick={openInvitation}
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

  /*
   * ==========================================
   * FIND INVITATION
   * ==========================================
   */
  if (step === "search") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16 flex items-center justify-center">

        <div className="w-full max-w-xl">

          <div className="text-center mb-12">

            <p className="text-xs tracking-[0.4em] uppercase text-[#9a7654] mb-5">
              Your Invitation
            </p>

            <h1 className="font-serif text-5xl md:text-6xl">
              Find Your Invitation
            </h1>

            <p className="mt-5 text-[#756d63]">
              Please enter the name exactly as it appears on your invitation.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm">

            <form onSubmit={searchInvitation} className="space-y-8">

              <div>
                <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                  Name on Invitation
                </label>

                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => {
                    setSearchName(e.target.value);
                    setNotFound(false);
                    setStatus("");
                  }}
                  placeholder="Enter your full name"
                  required
                  autoFocus
                  className="w-full border-b border-[#d8d1c7] bg-transparent py-4 outline-none focus:border-[#29251f] text-lg"
                />
              </div>

              {notFound && (
                <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">

                  <p className="text-xs tracking-[0.25em] uppercase text-[#9a7654]">
                    Invitation Not Found
                  </p>

                  <h2 className="font-serif text-2xl mt-3">
                    We couldn't find your invitation
                  </h2>

                  <p className="text-sm text-[#756d63] mt-3 leading-6">
                    Please check the spelling of your name. If you do not have
                    an invitation, you can continue as a Walk-In guest.
                  </p>

                  <button
                    type="button"
                    onClick={continueAsWalkIn}
                    className="mt-6 w-full rounded-full bg-[#29251f] text-white py-4 text-xs tracking-[0.25em] uppercase hover:bg-[#3b352e] transition"
                  >
                    RSVP as Walk-In
                  </button>

                </div>
              )}

              {status && (
                <p className="text-center text-sm text-red-600">
                  {status}
                </p>
              )}

              {!notFound && (
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full rounded-full bg-[#29251f] text-white py-5 text-xs tracking-[0.3em] uppercase hover:bg-[#3b352e] transition disabled:opacity-50"
                >
                  {searching ? "Searching..." : "Find My Invitation"}
                </button>
              )}

            </form>

          </div>

          <button
            type="button"
            onClick={startAgain}
            className="block mx-auto mt-8 text-xs tracking-[0.2em] uppercase text-[#9a7654]"
          >
            ← Back
          </button>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * INVITATION FOUND
   * ==========================================
   */
  if (step === "found") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16 flex items-center justify-center">

        <div className="w-full max-w-2xl">

          <div className="text-center mb-10">

            <p className="text-xs tracking-[0.4em] uppercase text-[#9a7654] mb-5">
              Invitation Found
            </p>

            <h1 className="font-serif text-5xl md:text-6xl">
              Welcome, {invitedName}
            </h1>

            <p className="mt-5 text-[#756d63]">
              We are so happy to have you celebrate with us.
            </p>

          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">

            <div className="text-center">

              <p className="text-xs tracking-[0.3em] uppercase text-[#9a7654]">
                You Are Invited
              </p>

              <h2 className="font-serif text-3xl md:text-4xl mt-5">
                Nezeal Ven & Shintal Khye
              </h2>

              <div className="my-8 flex items-center justify-center gap-4">
                <div className="h-px w-16 bg-[#c9b49e]" />

                <span className="text-[#9a7654]">♡</span>

                <div className="h-px w-16 bg-[#c9b49e]" />
              </div>

              <p className="text-sm text-[#756d63]">
                April 23, 2026 · 4:00 PM
              </p>

              <p className="mt-2 text-sm text-[#756d63]">
                E&J Grand Pavilion
              </p>

              <p className="text-sm text-[#756d63]">
                DC, Bukidnon
              </p>

            </div>

            <div className="mt-10 rounded-2xl bg-[#f8f5ef] p-7 text-center">

              <p className="text-xs tracking-[0.25em] uppercase text-[#9a7654]">
                Your Invitation
              </p>

              <p className="font-serif text-4xl mt-3">
                {seatsReserved}
              </p>

              <p className="text-sm uppercase tracking-[0.15em] text-[#756d63] mt-1">
                {seatsReserved === 1 ? "Seat Reserved" : "Seats Reserved"}
              </p>

            </div>

            {/* TEMPORARY WHO IS JOINING */}
            <div className="mt-8 text-center">

              <p className="text-xs tracking-[0.25em] uppercase text-[#9a7654]">
                Joining You
              </p>

              <p className="font-serif text-xl mt-3">
                {invitedName}
              </p>

              <p className="text-xs text-[#8a8177] mt-2">
                Your invited guest list can be connected here next.
              </p>

            </div>

            <button
              type="button"
              onClick={continueToRSVP}
              className="mt-10 w-full rounded-full bg-[#29251f] text-white py-5 text-xs tracking-[0.3em] uppercase hover:bg-[#3b352e] transition"
            >
              Continue to RSVP
            </button>

          </div>

          <button
            type="button"
            onClick={() => setStep("search")}
            className="block mx-auto mt-8 text-xs tracking-[0.2em] uppercase text-[#9a7654]"
          >
            ← Search Again
          </button>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * RSVP FORM
   * ==========================================
   */
  if (step === "rsvp" || step === "walkin") {
    const isWalkIn = step === "walkin";

    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16">

        <div className="max-w-3xl mx-auto">

          <section className="text-center mb-12">

            <p className="text-xs tracking-[0.4em] uppercase text-[#9a7654] mb-5">
              {isWalkIn ? "Walk-In RSVP" : "Kindly Respond"}
            </p>

            <h1 className="font-serif text-5xl md:text-6xl">
              {isWalkIn
                ? "We'd Love to Hear From You"
                : "Will you celebrate with us?"}
            </h1>

            <p className="mt-5 text-[#756d63]">
              {isWalkIn
                ? "Please complete the form below to RSVP as a Walk-In guest."
                : `Your invitation includes ${seatsReserved} ${
                    seatsReserved === 1 ? "seat" : "seats"
                  }.`}
            </p>

          </section>

          <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm">

            {!isWalkIn && (
              <div className="rounded-2xl bg-[#f8f5ef] p-5 text-center mb-8">

                <p className="text-xs tracking-[0.25em] uppercase text-[#9a7654]">
                  Invitation
                </p>

                <p className="font-serif text-2xl mt-2">
                  {invitedName}
                </p>

                <p className="text-sm text-[#756d63] mt-1">
                  {seatsReserved}{" "}
                  {seatsReserved === 1 ? "seat" : "seats"} reserved
                </p>

              </div>
            )}

            {isWalkIn && (
              <div className="rounded-2xl bg-[#f8f5ef] p-5 text-center mb-8">

                <p className="text-xs tracking-[0.25em] uppercase text-[#9a7654]">
                  Walk-In Guest
                </p>

                <p className="text-sm text-[#756d63] mt-2">
                  Walk-In RSVPs are limited to 2 guests.
                </p>

              </div>
            )}

            <form
              onSubmit={submitRSVP}
              className="space-y-7"
            >

              {/* NAME */}
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

              {/* EMAIL */}
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

              {/* ATTENDANCE */}
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

              {/* NUMBER OF GUESTS */}
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

              {/* MESSAGE */}
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

              {status && (
                <div className="text-center text-sm text-red-600">
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#29251f] text-white py-5 text-xs tracking-[0.3em] uppercase hover:bg-[#3b352e] transition disabled:opacity-50"
              >
                {loading ? "Sending RSVP..." : "Send RSVP"}
              </button>

            </form>

            {isWalkIn && (
              <button
                type="button"
                onClick={() => {
                  setStep("search");
                  setNotFound(false);
                  setStatus("");
                }}
                className="block mx-auto mt-8 text-xs tracking-[0.2em] uppercase text-[#9a7654]"
              >
                ← Check My Invitation Again
              </button>
            )}

          </section>

        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * SUCCESS
   * ==========================================
   */
  if (step === "success") {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16 flex items-center justify-center">

        <div className="w-full max-w-xl text-center">

          <div className="text-5xl mb-8">
            ♡
          </div>

          <p className="text-xs tracking-[0.4em] uppercase text-[#9a7654] mb-5">
            RSVP Received
          </p>

          <h1 className="font-serif text-5xl md:text-6xl">
            Thank You!
          </h1>

          <p className="font-serif text-2xl mt-5">
            {step === "success" && invitedName
              ? `${invitedName}, we're so happy you'll be celebrating with us.`
              : "We're so happy to celebrate with you."}
          </p>

          <p className="text-[#756d63] mt-5">
            Your RSVP has been successfully received.
          </p>

          <div className="mt-10 bg-white rounded-3xl p-8 shadow-sm">

            <p className="font-serif text-2xl">
              Nezeal Ven & Shintal Khye
            </p>

            <p className="mt-4 text-sm text-[#756d63]">
              April 23, 2026 · 4:00 PM
            </p>

            <p className="text-sm text-[#756d63]">
              E&J Grand Pavilion
            </p>

            <p className="text-sm text-[#756d63]">
              DC, Bukidnon
            </p>

          </div>

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

          <button
            type="button"
            onClick={startAgain}
            className="mt-10 text-xs tracking-[0.2em] uppercase text-[#9a7654] underline underline-offset-4"
          >
            Return to Invitation
          </button>

        </div>
      </main>
    );
  }

  return null;
}
