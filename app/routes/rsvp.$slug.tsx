import { motion, useReducedMotion } from "framer-motion";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "react-router";
import { Link, useParams } from "react-router";
import { Icon } from "~/components/ui/icon";

const HERO_IMAGE =
	"https://images.unsplash.com/photo-1470093851219-69951fcbb533?auto=format&fit=crop&w=2000&q=80";
const COUNTDOWN_IMAGE =
	"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=2000&q=80";
const GALLERY_IMAGES = [
	"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
];

const WEDDING_DATE = new Date("2026-10-04T16:30:00-05:00");
const WEDDING_DATE_TEXT = "October 4th, 2026 | Tulum, Mexico";

const STORY_ITEMS = [
	{
		year: "2018",
		title: "A chance hello",
		description:
			"We met at a friend's rooftop dinner and talked until the city lights were the only thing left awake.",
	},
	{
		year: "2021",
		title: "Adventure years",
		description:
			"Between mountain drives and beach mornings, we learned that home is wherever we are together.",
	},
	{
		year: "2025",
		title: "The proposal",
		description:
			"On a golden evening by the sea, we promised forever and began dreaming of this day with you.",
	},
];

const PROGRAM_ITEMS = [
	{
		time: "3:30 PM",
		title: "Guests Arrival",
		description: "Welcome drinks and live acoustic music in the garden court.",
	},
	{
		time: "4:30 PM",
		title: "Ceremony",
		description: "Exchange of vows as the sun starts to set above the coast.",
	},
	{
		time: "6:00 PM",
		title: "Dinner & Toasts",
		description: "A shared table dinner followed by family speeches and stories.",
	},
	{
		time: "8:00 PM",
		title: "First Dance & Celebration",
		description: "Open dance floor, dessert, and a night of joy under the stars.",
	},
];

type AttendanceOption = "accepts" | "declines";

type RsvpValues = {
	fullName: string;
	email: string;
	attendance: AttendanceOption;
	guestCount: string;
	message: string;
};

type CountdownState = {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isComplete: boolean;
};

function titleCaseWord(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCoupleFromSlug(slug?: string) {
	if (!slug) {
		return "Jane & John";
	}

	const cleaned = slug
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, "")
		.split("-")
		.filter(Boolean);

	if (cleaned.length === 0) {
		return "Jane & John";
	}

	const connectorIndex = cleaned.findIndex(
		(part) => part === "and" || part === "x" || part === "weds",
	);

	if (connectorIndex > 0 && connectorIndex < cleaned.length - 1) {
		const partnerA = cleaned.slice(0, connectorIndex).map(titleCaseWord).join(" ");
		const partnerB = cleaned
			.slice(connectorIndex + 1)
			.map(titleCaseWord)
			.join(" ");
		return `${partnerA} & ${partnerB}`;
	}

	if (cleaned.length >= 2) {
		return `${titleCaseWord(cleaned[0])} & ${titleCaseWord(cleaned[1])}`;
	}

	return `${titleCaseWord(cleaned[0])} & Partner`;
}

function getCountdown(targetDate: Date): CountdownState {
	const msLeft = targetDate.getTime() - Date.now();

	if (msLeft <= 0) {
		return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
	}

	const totalSeconds = Math.floor(msLeft / 1000);
	const days = Math.floor(totalSeconds / (60 * 60 * 24));
	const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
	const seconds = totalSeconds % 60;

	return { days, hours, minutes, seconds, isComplete: false };
}

function formatCounterValue(value?: number) {
	if (typeof value !== "number") {
		return "--";
	}

	return String(Math.max(0, value)).padStart(2, "0");
}

export const meta: MetaFunction = ({ params }) => {
	const coupleNames = formatCoupleFromSlug(params.slug);
	return [
		{ title: `${coupleNames} | RSVP Invitation` },
		{
			name: "description",
			content: `Celebrate with ${coupleNames}. View the wedding details and submit your RSVP.`,
		},
	];
};

export default function RsvpWeddingPage() {
	const { slug } = useParams<{ slug: string }>();
	const prefersReducedMotion = useReducedMotion();
	const coupleNames = useMemo(() => formatCoupleFromSlug(slug), [slug]);
	const [partnerA, partnerB] = coupleNames.split(" & ");

	const [countdown, setCountdown] = useState<CountdownState | null>(null);
	const [values, setValues] = useState<RsvpValues>({
		fullName: "",
		email: "",
		attendance: "accepts",
		guestCount: "1",
		message: "",
	});
	const [formError, setFormError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		const refresh = () => setCountdown(getCountdown(WEDDING_DATE));
		refresh();
		const timerId = window.setInterval(refresh, 1000);
		return () => window.clearInterval(timerId);
	}, []);

	const revealInitial = prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
	const revealVisible = { opacity: 1, y: 0 };
	const revealTransition = prefersReducedMotion
		? { duration: 0.2 }
		: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

	function updateField<K extends keyof RsvpValues>(field: K, value: RsvpValues[K]) {
		setValues((previous) => ({ ...previous, [field]: value }));
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError(null);
		setSuccessMessage(null);

		const trimmedName = values.fullName.trim();
		const trimmedEmail = values.email.trim();
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!trimmedName || !trimmedEmail) {
			setFormError("Please provide your full name and email address.");
			return;
		}

		if (!emailPattern.test(trimmedEmail)) {
			setFormError("Please use a valid email address.");
			return;
		}

		const responseLabel =
			values.attendance === "accepts" ? "Joyfully accepts" : "Regretfully declines";
		setSuccessMessage(`${trimmedName}, your RSVP has been sent: ${responseLabel}.`);
		setValues((previous) => ({
			...previous,
			fullName: trimmedName,
			email: trimmedEmail,
		}));
	}

	return (
		<div
			className="light min-h-screen bg-[var(--invite-bg)] text-[var(--invite-ink)] [--invite-bg:#f3eee6] [--invite-paper:#f8f4ef] [--invite-card:#ffffff] [--invite-ink:#202733] [--invite-soft:#667085] [--invite-accent:#c07c5d] [--invite-accent-strong:#a66345] [--invite-border:#ded5ca]"
			style={{ fontFamily: "'Cormorant Garamond', serif" }}>
			<section className="relative isolate flex min-h-[92svh] items-center justify-center overflow-hidden px-6 py-24">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${HERO_IMAGE})` }}
				/>
				<div className="absolute inset-0 bg-black/35" />
				<div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[var(--invite-bg)] to-transparent" />

				<motion.div
					initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: prefersReducedMotion ? 0.25 : 0.8 }}
					className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center text-white">
					<p className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-white/80 sm:text-sm">
						WE CORDIALLY INVITE YOU TO CELEBRATE
					</p>
					<h1
						className="text-5xl leading-none sm:text-7xl md:text-8xl"
						style={{ fontFamily: "'Playfair Display', serif" }}>
						{partnerA || "Jane"}{" "}
						<span className="text-[var(--invite-accent)]">&amp;</span>{" "}
						{partnerB || "John"}
					</h1>
					<p className="mt-6 text-lg text-white/90 sm:text-2xl">
						Where the wild roses grow
					</p>
					<p className="mt-3 text-sm tracking-[0.2em] text-white/80 sm:text-base">
						{WEDDING_DATE_TEXT}
					</p>

					<a
						href="#our-story"
						className="mt-12 inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-2 text-sm tracking-[0.15em] text-white/90 transition hover:bg-white/10">
						DISCOVER
						<Icon name="keyboard_arrow_down" size={18} />
					</a>
				</motion.div>
			</section>

			<motion.section
				id="our-story"
				initial={revealInitial}
				whileInView={revealVisible}
				viewport={{ once: true, amount: 0.2 }}
				transition={revealTransition}
				className="mx-auto max-w-6xl px-6 pb-20 pt-8 md:pb-24">
				<div className="mb-12 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent-strong)]">
						Our Story
					</p>
					<h2
						className="mt-3 text-4xl text-[var(--invite-ink)] sm:text-5xl md:text-6xl"
						style={{ fontFamily: "'Playfair Display', serif" }}>
						A love that kept finding its way
					</h2>
				</div>

				<div className="grid gap-6 md:grid-cols-3">
					{STORY_ITEMS.map((item, index) => (
						<motion.article
							key={item.year}
							initial={revealInitial}
							whileInView={revealVisible}
							viewport={{ once: true, amount: 0.35 }}
							transition={{
								...revealTransition,
								delay: prefersReducedMotion ? 0 : 0.08 * index,
							}}
							className="rounded-3xl border border-[var(--invite-border)] bg-[var(--invite-paper)] p-6 shadow-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--invite-accent-strong)]">
								{item.year}
							</p>
							<h3
								className="mt-4 text-3xl leading-tight text-[var(--invite-ink)]"
								style={{ fontFamily: "'Playfair Display', serif" }}>
								{item.title}
							</h3>
							<p className="mt-4 text-lg leading-relaxed text-[var(--invite-soft)]">
								{item.description}
							</p>
						</motion.article>
					))}
				</div>
			</motion.section>

			<section
				id="countdown"
				className="relative isolate overflow-hidden px-6 py-24 md:py-28">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url(${COUNTDOWN_IMAGE})` }}
				/>
				<div className="absolute inset-0 bg-black/45" />

				<motion.div
					initial={revealInitial}
					whileInView={revealVisible}
					viewport={{ once: true, amount: 0.2 }}
					transition={revealTransition}
					className="relative mx-auto max-w-5xl text-center text-white">
					<h2
						className="text-4xl sm:text-5xl"
						style={{ fontFamily: "'Playfair Display', serif" }}>
						The Countdown Begins
					</h2>

					<div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
						{[
							{ label: "Days", value: formatCounterValue(countdown?.days) },
							{ label: "Hours", value: formatCounterValue(countdown?.hours) },
							{ label: "Minutes", value: formatCounterValue(countdown?.minutes) },
							{ label: "Seconds", value: formatCounterValue(countdown?.seconds) },
						].map((item) => (
							<div
								key={item.label}
								className="rounded-xl border border-white/30 bg-white/10 px-4 py-5 shadow-lg backdrop-blur-sm">
								<p
									className="text-4xl leading-none sm:text-5xl"
									style={{ fontFamily: "'Playfair Display', serif" }}>
									{item.value}
								</p>
								<p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/80">
									{item.label}
								</p>
							</div>
						))}
					</div>

					<p className="mt-6 text-sm tracking-[0.15em] text-white/80 sm:text-base">
						{WEDDING_DATE_TEXT}
					</p>
					{countdown?.isComplete ? (
						<p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--invite-accent)]">
							The celebration has started
						</p>
					) : null}
				</motion.div>
			</section>

			<motion.section
				id="program"
				initial={revealInitial}
				whileInView={revealVisible}
				viewport={{ once: true, amount: 0.2 }}
				transition={revealTransition}
				className="mx-auto max-w-6xl px-6 py-20 md:py-24">
				<div className="mb-10 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent-strong)]">
						Wedding Program
					</p>
					<h2
						className="mt-3 text-4xl text-[var(--invite-ink)] sm:text-5xl md:text-6xl"
						style={{ fontFamily: "'Playfair Display', serif" }}>
						Your day with us
					</h2>
				</div>

				<div className="rounded-3xl border border-[var(--invite-border)] bg-[var(--invite-paper)] p-6 shadow-sm md:p-8">
					<div className="grid gap-5 md:grid-cols-2">
						{PROGRAM_ITEMS.map((item, index) => (
							<motion.div
								key={item.time}
								initial={revealInitial}
								whileInView={revealVisible}
								viewport={{ once: true, amount: 0.45 }}
								transition={{
									...revealTransition,
									delay: prefersReducedMotion ? 0 : 0.08 * index,
								}}
								className="rounded-2xl border border-[var(--invite-border)] bg-[var(--invite-card)] px-5 py-6">
								<p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--invite-accent-strong)]">
									{item.time}
								</p>
								<h3
									className="mt-3 text-3xl leading-tight text-[var(--invite-ink)]"
									style={{ fontFamily: "'Playfair Display', serif" }}>
									{item.title}
								</h3>
								<p className="mt-3 text-lg text-[var(--invite-soft)]">
									{item.description}
								</p>
							</motion.div>
						))}
					</div>
				</div>
			</motion.section>

			<motion.section
				id="gallery"
				initial={revealInitial}
				whileInView={revealVisible}
				viewport={{ once: true, amount: 0.15 }}
				transition={revealTransition}
				className="mx-auto max-w-6xl px-6 pb-20 md:pb-24">
				<div className="mb-10 text-center">
					<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent-strong)]">
						Gallery
					</p>
					<h2
						className="mt-3 text-4xl text-[var(--invite-ink)] sm:text-5xl md:text-6xl"
						style={{ fontFamily: "'Playfair Display', serif" }}>
						Moments we cherish
					</h2>
				</div>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{GALLERY_IMAGES.map((imageUrl, index) => (
						<motion.figure
							key={imageUrl}
							initial={revealInitial}
							whileInView={revealVisible}
							viewport={{ once: true, amount: 0.35 }}
							transition={{
								...revealTransition,
								delay: prefersReducedMotion ? 0 : 0.05 * index,
							}}
							className={`group relative overflow-hidden rounded-2xl ${
								index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
							}`}>
							<img
								src={imageUrl}
								alt={`Romantic memory ${index + 1}`}
								className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-72"
								loading="lazy"
							/>
							<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
						</motion.figure>
					))}
				</div>
			</motion.section>

			<section id="rsvp" className="px-6 pb-24">
				<motion.div
					initial={revealInitial}
					whileInView={revealVisible}
					viewport={{ once: true, amount: 0.2 }}
					transition={revealTransition}
					className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-[var(--invite-border)] bg-[var(--invite-paper)] shadow-xl">
					<div className="grid md:grid-cols-2">
						<div className="border-b border-[var(--invite-border)] p-8 md:border-b-0 md:border-r md:p-12">
							<p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--invite-accent-strong)]">
								Kindly Reply
							</p>
							<h2
								className="text-5xl leading-none text-[var(--invite-ink)] sm:text-6xl"
								style={{ fontFamily: "'Playfair Display', serif" }}>
								Will you join us?
							</h2>
							<p className="mt-6 text-2xl italic text-[var(--invite-soft)]">
								"Love is the flower you have got to let grow."
							</p>
							<p className="mt-2 text-lg text-[var(--invite-soft)]">- John Lennon</p>

							<div className="mt-16">
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--invite-accent-strong)]">
									Return to
								</p>
								<p
									className="mt-3 text-4xl text-[var(--invite-ink)]"
									style={{ fontFamily: "'Playfair Display', serif" }}>
									{coupleNames}
								</p>
								<p className="mt-3 text-xl leading-relaxed text-[var(--invite-soft)]">
									123 Bohemian Way
									<br />
									Tulum, Mexico 77760
								</p>
								<p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--invite-accent-strong)]">
									Please reply by September 10th, 2026
								</p>
							</div>
						</div>

						<div className="relative p-8 md:p-12">
							<div className="pointer-events-none absolute right-8 top-8 hidden h-20 w-20 items-center justify-center rounded-full border border-[var(--invite-border)] text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--invite-soft)] sm:flex">
								Postage
								<br />
								Paid
								<br />
								Love Air
							</div>

							<form onSubmit={handleSubmit} className="space-y-6">
								<label className="block">
									<span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--invite-soft)]">
										Full Name
									</span>
									<input
										type="text"
										value={values.fullName}
										onChange={(event) =>
											updateField("fullName", event.target.value)
										}
										className="mt-2 w-full border-b border-[var(--invite-border)] bg-transparent px-0 py-2 text-xl text-[var(--invite-ink)] outline-none transition focus:border-[var(--invite-accent)]"
										placeholder="Enter your full name"
										required
									/>
								</label>

								<label className="block">
									<span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--invite-soft)]">
										Email Address
									</span>
									<input
										type="email"
										value={values.email}
										onChange={(event) =>
											updateField("email", event.target.value)
										}
										className="mt-2 w-full border-b border-[var(--invite-border)] bg-transparent px-0 py-2 text-xl text-[var(--invite-ink)] outline-none transition focus:border-[var(--invite-accent)]"
										placeholder="you@example.com"
										required
									/>
								</label>

								<div className="grid gap-4 sm:grid-cols-2">
									<label className="flex items-center gap-3 text-xl text-[var(--invite-ink)]">
										<input
											type="radio"
											name="attendance"
											value="accepts"
											checked={values.attendance === "accepts"}
											onChange={() => updateField("attendance", "accepts")}
											className="h-4 w-4"
										/>
										Joyfully Accepts
									</label>
									<label className="flex items-center gap-3 text-xl text-[var(--invite-ink)]">
										<input
											type="radio"
											name="attendance"
											value="declines"
											checked={values.attendance === "declines"}
											onChange={() => updateField("attendance", "declines")}
											className="h-4 w-4"
										/>
										Regretfully Declines
									</label>
								</div>

								<div className="grid gap-6 sm:grid-cols-2">
									<label className="block">
										<span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--invite-soft)]">
											Number of Guests
										</span>
										<select
											value={values.guestCount}
											onChange={(event) =>
												updateField("guestCount", event.target.value)
											}
											className="mt-2 w-full border-b border-[var(--invite-border)] bg-transparent px-0 py-2 text-xl text-[var(--invite-ink)] outline-none transition focus:border-[var(--invite-accent)]">
											<option value="1">1 guest</option>
											<option value="2">2 guests</option>
											<option value="3">3 guests</option>
											<option value="4">4 guests</option>
										</select>
									</label>

									<label className="block">
										<span className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--invite-soft)]">
											Note (Optional)
										</span>
										<input
											type="text"
											value={values.message}
											onChange={(event) =>
												updateField("message", event.target.value)
											}
											className="mt-2 w-full border-b border-[var(--invite-border)] bg-transparent px-0 py-2 text-xl text-[var(--invite-ink)] outline-none transition focus:border-[var(--invite-accent)]"
											placeholder="Share a short message"
										/>
									</label>
								</div>

								<button
									type="submit"
									className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--invite-accent)] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[var(--invite-accent-strong)]">
									Send Response
									<Icon name="arrow_forward" size={18} />
								</button>
							</form>

							<div aria-live="polite" className="mt-4 min-h-6">
								{formError ? (
									<p className="text-sm font-semibold text-red-700">
										{formError}
									</p>
								) : null}
								{successMessage ? (
									<p className="text-sm font-semibold text-emerald-700">
										{successMessage}
									</p>
								) : null}
							</div>
						</div>
					</div>
				</motion.div>
			</section>

			<footer className="border-t border-[var(--invite-border)] bg-[var(--invite-paper)] px-6 py-10">
				<div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--invite-accent-strong)]">
							With love
						</p>
						<p
							className="mt-2 text-4xl text-[var(--invite-ink)]"
							style={{ fontFamily: "'Playfair Display', serif" }}>
							{coupleNames}
						</p>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-3">
						<a
							href="#our-story"
							className="rounded-full border border-[var(--invite-border)] px-4 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--invite-soft)] transition hover:border-[var(--invite-accent)] hover:text-[var(--invite-ink)]">
							Our Story
						</a>
						<a
							href="#program"
							className="rounded-full border border-[var(--invite-border)] px-4 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--invite-soft)] transition hover:border-[var(--invite-accent)] hover:text-[var(--invite-ink)]">
							Program
						</a>
						<a
							href="#rsvp"
							className="rounded-full border border-[var(--invite-border)] px-4 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--invite-soft)] transition hover:border-[var(--invite-accent)] hover:text-[var(--invite-ink)]">
							RSVP
						</a>
						<Link
							to="/"
							className="rounded-full border border-[var(--invite-border)] px-4 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--invite-soft)] transition hover:border-[var(--invite-accent)] hover:text-[var(--invite-ink)]">
							Home
						</Link>
					</div>
				</div>
			</footer>
		</div>
	);
}
