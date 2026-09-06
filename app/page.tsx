"use client";

import { FormEvent, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [opened, setOpened] = useState(false);

  // RSVP mode
  const [walkIn, setWalkIn] = useState(false);

  // Show Walk-In option only after invitation search fails
  const [invitationNotFound, setInvitationNotFound] = useState(false);

  // Guest information
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [attendance, setAttendance] = useState("attending");
  const [guests, setGuests] = useState("1");
  const [message, setMessage] = useState("");

  // Status
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Invitation information
  const [seatsReserved, setSeatsReserved] = useState<number | null>(null);
  const [invitedName, setInvitedName] = useState("");

  async function submitRSVP(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setStatus("");

    const name = guestName.trim();

    if (!name) {
      setStatus("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (!supabase) {
      setStatus("Supabase is not configured.");
      setLoading(false);
      return;
    }

    /*
     * WALK-IN RSVP
     * This happens only after the guest chooses
     * "RSVP as Walk-In".
     */
    if (walkIn) {
      const numberOfGuests = Number(guests);

      if (numberOfGuests > 2) {
        setStatus("Walk-In RSVPs are limited to 2 guests.");
        setGuests("2");
        setLoading(false);
        return;
      }

      const finalMessage = `[WALK-IN RSVP]${
        message ? ` ${message}` : ""
      }`;

      const { error } = await supabase.from("rsvps").insert({
        guest_name: name,
        email: email.trim(),
        attendance: attendance,
        guests: numberOfGuests,
        message: finalMessage,
      });

      if (error) {
        console.error(error);

        setStatus(`Unable to send RSVP: ${error.message}`);
        setLoading(false);
        return;
      }

      setStatus("Thank you! Your Walk-In RSVP has been received. ❤️");

      setLoading(false);
      return;
    }

    /*
     * INVITED GUEST RSVP
     *
     * Search the name in invited_guests AFTER
     * the guest has filled out the form.
     */
    const { data, error: invitationError } = await supabase
      .from("invited_guests")
      .select("full_name, seats_reserved")
      .ilike("full_name", name)
      .maybeSingle();

    if (invitationError) {
      console.error(invitationError);

      setStatus(
        "We couldn't check your invitation right now. Please try again."
      );

      setLoading(false);
      return;
    }

    /*
     * NAME NOT FOUND
     *
     * Don't reject immediately.
     * Show the Walk-In option.
     */
    if (!data) {
      setInvitationNotFound(true);
      setStatus("");

      setLoading(false);
      return;
    }

    /*
     * INVITATION FOUND
     */
    const reservedSeats = Number(data.seats_reserved) || 1;
    const numberOfGuests = Number(guests);

    setSeatsReserved(reservedSeats);
    setInvitedName(data.full_name);
    setInvitationNotFound(false);

    /*
     * If guest selected more guests than their invitation allows,
     * don't submit yet.
     */
    if (numberOfGuests > reservedSeats) {
      setStatus(
        `Your invitation is reserved for ${reservedSeats} ${
          reservedSeats === 1 ? "guest" : "guests"
        }.`
      );

      setGuests(String(reservedSeats));

      setLoading(false);
      return;
    }

    /*
     * Save invited guest RSVP.
     */
    const { error } = await supabase.from("rsvps").insert({
      guest_name: data.full_name,
      email: email.trim(),
      attendance: attendance,
      guests: numberOfGuests,
      message: message || null,
    });

    if (error) {
      console.error(error);

      setStatus(`Unable to send RSVP: ${error.message}`);

      setLoading(false);
      return;
    }

    setStatus(
      `Thank you, ${data.full_name}! Your RSVP has been received. ❤️`
    );

    setLoading(false);
  }

  function resetForm() {
    setGuestName("");
    setEmail("");
    setAttendance("attending");
    setGuests("1");
    setMessage("");
    setSeatsReserved(null);
    setInvitedName("");
    setInvitationNotFound(false);
    setStatus("");
  }

  /*
   * Guest chooses Walk-In AFTER their invitation
   * could not be found.
   */
  function chooseWalkIn() {
    setWalkIn(true);
    setInvitationNotFound(false);
    setSeatsReserved(null);
    setInvitedName("");
    setStatus("");
  }

  function backToInvitationRSVP() {
    setWalkIn(false);
    setInvitationNotFound(false);
    setSeatsReserved(null);
    setInvitedName("");
    setStatus("");
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

  if (!opened) {
    return (
      <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] flex items-center justify-center px-6 relative overflow-hidden">
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

  return (
    <main className="min-h-screen bg-[#f8f5ef] text-[#29251f] px-6 py-16">
      <div className="max-w-3xl mx-auto">

        {/* RSVP HEADER */}
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

        {/* RSVP FORM */}
        <section className="bg-white rounded-3xl p-7 md:p-10 shadow-sm mb-14">

          <div className="text-center">
            <p className="text-xs tracking-[0.35em] uppercase text-[#9a7654] mb-4">
              RSVP
            </p>

            <h2 className="font-serif text-3xl md:text-4xl">
              {walkIn ? "Walk-In RSVP" : "Please RSVP"}
            </h2>

            <p className="mt-4 text-sm text-[#756d63] max-w-md mx-auto">
              {walkIn
                ? "Please review your information and submit your Walk-In RSVP."
                : "Fill out the form below. When you click Send RSVP, we will check your name against our invitation list."}
            </p>
          </div>

          <form
            onSubmit={submitRSVP}
            className="mt-10 space-y-7"
          >

            {/* NAME */}
            <div>
              <label className="block text-xs tracking-[0.25em] uppercase mb-3">
                Your Name
              </label>

              <input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                  setInvitationNotFound(false);
                  setStatus("");
                }}
                required
                placeholder="Enter your full name"
                className="w-full border-b border-[#d8d1c7] bg-transparent py-3 outline-none focus:border-[#29251f]"
              />

              {!walkIn && (
                <p className="text-xs text-[#8a8177] mt-2">
                  Enter the name exactly as it appears on your invitation.
                </p>
              )}
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

            {/* ATTENDANCE + GUESTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">

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

            {/* INVITATION STATUS */}
            <div className="rounded-2xl bg-[#f8f5ef] p-6 text-center">

              {!walkIn && !invitationNotFound && !invitedName && (
                <>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#9a7654]">
                    Invitation
                  </p>

                  <p className="font-serif text-xl mt-2">
                    Your invitation will be checked
                  </p>

                  <p className="text-xs text-[#8a8177] mt-2">
                    We will search your name after you click Send RSVP.
                  </p>
                </>
              )}

              {!walkIn && invitedName && seatsReserved && (
                <>
                  <p className="text-xs tracking-[0.2em] uppercase text-green-700">
                    Invitation Found
                  </p>

                  <p className="font-serif text-2xl mt-2">
                    Welcome, {invitedName}
                  </p>

                  <p className="text-sm text-[#756d63] mt-2">
                    Your invitation includes{" "}
                    <strong>
                      {seatsReserved}{" "}
                      {seatsReserved === 1 ? "seat" : "seats"}
                    </strong>
                    .
                  </p>
                </>
              )}

              {invitationNotFound && (
                <>
                  <p className="text-xs tracking-[0.2em] uppercase text-red-600">
                    Invitation Not Found
                  </p>

                  <p className="font-serif text-2xl mt-2">
                    We couldn't find your invitation
                  </p>

                  <p className="text-sm text-[#756d63] mt-3">
                    Please check the spelling of your name. If you do not have
                    an invitation, you may continue as a Walk-In RSVP.
                  </p>

                  <button
                    type="button"
                    onClick={chooseWalkIn}
                    className="mt-5 w-full bg-[#29251f] text-white rounded-full py-4 tracking-[0.2em] uppercase text-xs hover:bg-[#3b352e] transition"
                  >
                    RSVP as Walk-In
                  </button>
                </>
              )}

              {walkIn && (
                <>
                  <p className="text-xs tracking-[0.2em] uppercase text-[#9a7654]">
                    Walk-In RSVP
                  </p>

                  <p className="font-serif text-xl mt-2">
                    Maximum 2 guests
                  </p>

                  <p className="text-xs text-[#8a8177] mt-2">
                    Your RSVP will be recorded as a Walk-In guest.
                  </p>
                </>
              )}

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

            {/* STATUS */}
            {status && (
              <div
                className={`text-center text-sm ${
                  status.includes("received")
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {status}
              </div>
            )}

            {/* SUBMIT */}
            {!invitationNotFound && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#29251f] text-white rounded-full py-5 tracking-[0.25em] uppercase text-sm hover:bg-[#3b352e] transition disabled:opacity-50"
              >
                {loading
                  ? walkIn
                    ? "Sending Walk-In RSVP..."
                    : "Checking Invitation..."
                  : "Send RSVP"}
              </button>
            )}

          </form>

          {/* BACK TO INVITATION */}
          {walkIn && (
            <div className="mt-8 pt-8 border-t border-[#eee8df] text-center">

              <p className="text-sm text-[#756d63] mb-4">
                Think you have an invitation?
              </p>

              <button
                type="button"
                onClick={backToInvitationRSVP}
                className="text-xs tracking-[0.2em] uppercase text-[#9a7654] underline underline-offset-4"
              >
                Check My Invitation
              </button>

            </div>
          )}

        </section>

        {/* WEDDING DETAILS */}
        <section className="text-center mb-14">

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

        <footer className="text-center mt-12 text-sm text-[#8a8177]">
          <p>
            We can't wait to celebrate with you. ❤️
          </p>
        </footer>

      </div>
    </main>
  );
}
