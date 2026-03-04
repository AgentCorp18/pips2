# PIPS 2.0 — Comprehensive Branding & Identity Guide

**Version:** 2.1 — Updated 2026-03-04
**Date:** March 2026
**Author:** Marc Albers + Claude
**Status:** Draft for founder review
**Classification:** Internal
**v2.1 changes:** Added Section 4.6 (Post-MVP Component Patterns) covering Cadence Bar, Content Reader, Training UI, Marketing Landing components, and SEO component patterns. Added build-status markers to component sections.

---

## Table of Contents

1. [Brand Strategy](#1-brand-strategy)
2. [Naming](#2-naming)
3. [Visual Identity System](#3-visual-identity-system)
4. [UI Design Language](#4-ui-design-language)
   - 4.1-4.5: Core component styling, step visual system, layout, animation
   - 4.6: Post-MVP Component Patterns (Cadence Bar, Content Reader, Training UI, Marketing) — **NEW in v2.1**
5. [Brand Application](#5-brand-application)
6. [Brand Guidelines Summary](#6-brand-guidelines-summary)
7. [White-Label Considerations](#7-white-label-considerations)
8. [CSS Design Tokens](#8-css-design-tokens)

---

## 1. Brand Strategy

### 1.1 Brand Purpose

**Why does this brand exist?**

Most organizations know they need to improve. They invest in project management tools, hire consultants, attend workshops. But the tools they use separate _what needs to get done_ from _how to think about what needs to get done._ Jira tracks tickets. Asana manages tasks. Neither one teaches a team how to properly define a problem, find the root cause, or measure whether their solution actually worked.

PIPS 2.0 exists to close that gap. It embeds a proven problem-solving methodology into the daily work of organizations so that improvement is not a separate initiative people attend a training for -- it is the way work gets done.

**Purpose statement:** _To make structured problem-solving and continuous improvement the default operating system for how organizations work._

### 1.2 Brand Vision

**What does PIPS 2.0 aspire to be?**

The standard that organizations reach for when they say "we want to get better." Not a tool they use alongside their methodology, but the place where methodology and work management are the same thing. In five years, when a VP of Operations says "we need to fix this," the natural next step is opening PIPS 2.0 and walking the team through a structured process -- not scheduling a meeting, not opening a spreadsheet, not hiring a consultant.

**Vision statement:** _Every organization has a repeatable, measurable system for solving problems and improving processes -- and it lives where their teams already work._

### 1.3 Brand Mission

**What does PIPS 2.0 do every day?**

PIPS 2.0 gives teams a structured 6-step workflow for process improvement and problem solving, embedded in enterprise-grade project management software. It guides teams from problem identification through root cause analysis, solution design, implementation, and measurable evaluation -- while also handling the everyday tickets, tasks, and projects that result from that process.

**Mission statement:** _We give organizations the methodology and the tools to identify, solve, and measure their most important problems -- in one platform._

### 1.4 Brand Values

**Five core values that govern every decision:**

#### 1. Structured Clarity

Ambiguity kills improvement projects. Every feature, every screen, every workflow in this product reduces ambiguity. We believe that a well-defined problem is half-solved, and our product reflects that belief in how it guides users. Our brand communication is similarly direct -- no jargon, no buzzword soup, no vague promises.

#### 2. Measurable Impact

If you cannot measure it, you cannot improve it. We are obsessed with outcomes, not activity. Our product measures results. Our marketing cites real numbers. Our customers know exactly what they are getting and can prove it worked.

#### 3. Accessible Rigor

The best methodologies in the world are useless if only experts can apply them. This product takes the rigor of Six Sigma, Lean, and PDCA and makes it accessible to any team -- without dumbing it down. Our brand strikes the same balance: professional and substantive, but never intimidating or exclusive.

#### 4. Continuous Evolution

Step 6 feeds back to Step 1. This is not just a product feature; it is a philosophy. We improve our own product, our own processes, and our own brand the same way we teach others to. Nothing is static. Everything is iterable.

#### 5. Earned Trust

We serve operations leaders, strategy executives, and consultants who manage high-stakes initiatives. Trust is the price of entry. We earn it through transparency, reliability, data privacy, and following through on what we promise. Our brand projects confidence, not hype.

### 1.5 Brand Personality

**If this product were a person, who would they be?**

A senior operations leader who moonlights as a really good coach. They have run improvement programs at organizations across industries -- hospitals, factories, software companies. They have seen what works and what does not. They are precise, data-driven, and structured in their thinking. But they are also genuinely warm. They buy the first round after a tough workshop. They explain fishbone diagrams using pizza delivery examples. They make hard problems feel solvable and make people feel capable, not inadequate.

They dress sharp -- clean, modern, maybe a nice watch -- but they will roll up their sleeves and get on the floor with you. They are the person who brings structure to chaos without making anyone feel talked down to, and who celebrates wins as loudly as they diagnose problems.

**Personality traits:**

- **Authoritative** but not arrogant
- **Precise** but not rigid
- **Warm** but not casual
- **Modern** but not trendy
- **Ambitious** but not reckless
- **Fun** but not unserious

### 1.6 The Fun + Enterprise Tension

This is the core brand challenge: how do you feel approachable to a team of 4 AND credible to a VP at a Fortune 500?

The answer is not to pick one and compromise on the other. The answer is to be like the best modern SaaS brands -- Slack, Notion, Figma, Linear -- that proved you can be both. Here is how this plays out across the brand:

**Where FUN shows up:**

- The name itself (short, memorable, has personality)
- Microcopy and empty states (human, occasionally witty, never robotic)
- The step colors (vibrant, energetic, not muted corporate pastels)
- Illustrations and loading states (character, warmth, delight)
- Marketing voice (confident and direct, not stiff or formal)
- Onboarding experience (encouraging, conversational)

**Where ENTERPRISE shows up:**

- The primary color palette (deep, saturated, authoritative)
- Typography (clean, precise, structured)
- Data visualization (dense, information-rich, no decoration for decoration's sake)
- Product architecture (role-based access, SSO, audit logs, compliance)
- Pricing page and sales materials (ROI-focused, data-driven)
- White-label capabilities (the product disappears behind the client's brand)
- Documentation (thorough, well-organized, assumes intelligence)

**The rule of thumb:** The product earns the right to be fun by being excellent first. Delight is the reward for getting the fundamentals right. A witty empty state message is charming when the product just saved someone 2 hours. It is annoying when the product just crashed.

### 1.7 Brand Voice Attributes

**How this product speaks:**

| Attribute       | What it sounds like                                                                                    | What it does NOT sound like                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **Direct**      | "Define your problem in one measurable statement."                                                     | "Consider exploring the various dimensions of your challenge space."        |
| **Substantive** | "Teams using structured root cause analysis resolve issues 2.3x faster."                               | "Supercharge your problem-solving! 10x your results!"                       |
| **Guiding**     | "Start here. Identify who is affected and what success looks like."                                    | "Figure out what your problem is and enter it."                             |
| **Confident**   | "This is a proven 6-step approach."                                                                    | "We think this might work for you."                                         |
| **Human**       | "Every organization has that one process that everyone complains about but nobody fixes. Start there." | "Leverage our platform to optimize your organizational throughput vectors." |
| **Inclusive**   | "Whether you run a hospital, a factory, or a software company."                                        | "For enterprise-class operational excellence professionals."                |

**Tone calibration by context:**

- **Marketing website:** Confident + Human. Lead with outcomes, speak in the second person ("you"), use concrete examples.
- **Product UI:** Direct + Guiding. Short, action-oriented copy. Tell users what to do next.
- **Documentation:** Substantive + Inclusive. Thorough, well-organized, assumes intelligence but not prior knowledge.
- **Sales materials:** Confident + Substantive. Data-driven, ROI-focused, respectful of buyer's time.
- **Error messages:** Human + Direct. Acknowledge the problem, explain what happened, tell them what to do.

#### Sample Copy: Marketing Headlines

1. "Every organization has problems. The best ones have a system for solving them."
2. "Stop managing tasks. Start solving problems."
3. "The gap between 'we should fix that' and 'we fixed it' -- closed."
4. "Six steps. One platform. Measurable results."
5. "Your methodology should live where your work lives."

#### Sample Copy: Product UI Strings

1. **Step advancement:** "Nice work. Step 2 is complete -- you have identified 3 root causes. Ready to generate solutions?"
2. **Project creation:** "What problem are you solving? Be specific -- a well-defined problem is half-solved."
3. **Dashboard greeting:** "Good morning. You have 4 projects in progress and 2 waiting for your review."
4. **Completion:** "Project complete. Your team reduced processing time by 34% over 6 weeks."
5. **Empty search:** "No results for that search. Try broader terms, or check your filters."

#### Sample Copy: Error Messages

1. **Save failed:** "Your changes could not be saved. Check your connection and try again -- your work is still here."
2. **Permission denied:** "You do not have permission to do that. Ask your admin to adjust your role if you need access."
3. **Timeout:** "That took longer than expected and timed out. Try again, or contact support if it keeps happening."
4. **Validation:** "The problem statement needs to be at least 20 characters. Good problem statements are specific and measurable."
5. **404:** "This page does not exist. It may have been moved or deleted."

#### Sample Copy: Email Subject Lines

1. "Your weekly improvement digest -- 3 projects moved forward"
2. "Step 4 is waiting on you: Select & Plan for [Project Name]"
3. "You completed 12 improvement projects this quarter. Here is the impact."

#### Sample Copy: Social Posts

1. **LinkedIn:** "67% of strategies fail because of execution, not ideas. The problem is not planning -- it is the gap between the plan and the work. We built a product that closes that gap. Six structured steps. Built into the tools your team already uses. No more spreadsheets. No more 'we should really fix that someday.'"

2. **Twitter/X:** "Hot take: Your project management tool should teach your team HOW to solve problems, not just track whether they did. That is what we built."

### 1.8 Brand Promise

**What this product guarantees:**

_A clear, structured path from problem to solution -- and the tools to manage every step of the journey._

This promise has three components:

1. **Clarity:** You will never wonder "what should we do next?" The methodology guides you.
2. **Structure:** The 6-step framework is not a suggestion. It is built into the product.
3. **Completeness:** This is not just a methodology tool or just a project management tool. It is both.

### 1.9 Competitive Visual Positioning

How this brand looks and feels relative to the competitive landscape:

```
                        PLAYFUL / APPROACHABLE
                               ^
                               |
                    Notion     |     monday.com
                               |        Asana
                               |
   METHODOLOGY-  <-------------+------------->  TASK-
   DRIVEN                      |                 DRIVEN
                               |
               [THIS PRODUCT]  |     Linear
                               |        Jira
                    Rhythm     |     ClickUp
                    Systems    |
                               v
                        SERIOUS / ENTERPRISE
```

**Positioning statement:** This product occupies a unique quadrant -- methodology-driven like Rhythm Systems but with the approachability and modern design language of Notion or Linear. No competitor currently occupies this space.

**Visual differentiation from specific competitors:**

| Competitor         | Their visual identity                                                         | How we differ                                                                                                                                                   |
| ------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Asana**          | Coral/salmon pink, gradient illustrations, playful but increasingly corporate | We are warmer in copy but more structured visually. Our step color system gives us a richer, more purposeful palette than their monochrome-plus-coral approach. |
| **monday.com**     | Rainbow colors, rounded shapes, maximalist energy                             | We are more restrained and structured. Their rainbow is decorative; our 6 colors are functional (each color means something).                                   |
| **Jira**           | Atlassian blue, dense, utilitarian                                            | We share information density but pair it with warmth, guidance, and visual breathing room. We look like the product Jira would be if they started over in 2026. |
| **Linear**         | Grayscale + purple accent, minimal, developer-oriented                        | We share the clean minimalism but add color with purpose (step colors) and warmth (copy, illustrations). Linear is cool; we are warm.                           |
| **ClickUp**        | Purple/violet, feature-dense, "everything app" energy                         | We are focused where they are sprawling. Our visual identity communicates "structured methodology" not "infinite features."                                     |
| **Rhythm Systems** | Dated corporate design, green/blue, consultant-oriented                       | We are the modern version of what they are trying to be. Same problem space, completely different design generation.                                            |

---

## 2. Naming

### 2.1 Naming Strategy

The product needs a name that satisfies competing requirements:

1. **Enterprise credibility** -- a VP of Operations at a Fortune 500 needs to feel comfortable putting this in a budget request
2. **Approachability** -- a 4-person team at a startup needs to feel like this is for them too
3. **Personality** -- the founder wants something "fun" and memorable, not corporate-speak
4. **Searchability** -- the name should be ownable on page 1 of Google
5. **Pronounceability** -- easy to spell from hearing it, easy to say in a meeting
6. **Verb/possessive potential** -- the best product names work naturally in conversation

The V1 guide explored only two naming categories: descriptive compounds (Stepframe, SolveStack) and abstract aspirational words (Meridian, Clareo). This V2 explores five categories to give the founder real creative range.

### 2.2 Name Evaluation Criteria

Every name is scored against these six criteria (1-5 each, 30 max):

1. **Searchability** -- Can you own page 1 of Google? Is the .com or .app domain plausible?
2. **Brevity** -- One or two syllables preferred. Three max.
3. **Spellability** -- Can someone spell it correctly after hearing it once?
4. **Personality** -- Does it have character? Does it avoid generic enterprise-speak?
5. **Natural usage** -- Does it work as a verb, possessive, or in casual conversation?
6. **Fun + Enterprise balance** -- Does it feel approachable AND credible?

### 2.3 Category A: Verb-Forward Names

The best SaaS names often come from verbs. Slack, Notion, Loom, Rippling, Figma (from "figure"), Stripe -- these names feel alive because they imply action.

---

#### Option 1: Hone

**Meaning:** To sharpen, refine, perfect. "Hone your process." The word implies that you already have something good -- you are making it better. This is exactly what process improvement is: not starting from zero, but refining what exists.

**Domain plausibility:** hone.com is likely taken but hone.app, gethone.com, or honehq.com are realistic. There is an existing company called Hone (corporate training) which creates some namespace collision, but they are in a different category.

**In context:**

- "We use Hone for our improvement projects" -- natural, clean
- "Check the Hone board" -- works perfectly
- "I Hone'd it" -- stretches but passable
- "Hone Enterprise" -- professional enough

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 3 | Existing training company is a concern |
| Brevity | 5 | One syllable |
| Spellability | 5 | Common English word |
| Personality | 4 | Has warmth and craft feel |
| Natural usage | 4 | "Hone your process" is great |
| Fun + Enterprise | 3 | Slightly informal for enterprise |
| **Total** | **24/30** | |

---

#### Option 2: Notch

**Meaning:** To achieve or score ("notch a win"), and also a small cut or mark that indicates progress (notches on a belt, notching up). Suggests incremental, measurable improvement. Each step is a notch forward.

**Domain plausibility:** notch.com is almost certainly taken (Minecraft creator). notch.app, usenotch.com, or getnotch.com are plausible. Namespace collision with Notch (Markus Persson) is a concern for search.

**In context:**

- "We use Notch for our improvement projects" -- good
- "Check the Notch board" -- natural
- "We notched three projects this quarter" -- excellent verb usage
- "Notch Enterprise" -- solid

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 2 | Minecraft creator dominates search |
| Brevity | 5 | One syllable |
| Spellability | 5 | Common English word |
| Personality | 4 | Punchy, active, has energy |
| Natural usage | 5 | "Notch a win" is perfect |
| Fun + Enterprise | 4 | Good balance |
| **Total** | **25/30** | Held back by search collision |

---

#### Option 3: Rally

**Meaning:** To come together for a common purpose; to recover or improve. "Rally the team." Suggests collective action, momentum, and recovery -- all central to process improvement. Sports connotation (a comeback rally) adds energy.

**Domain plausibility:** rally.com is taken. rally.app, rallypm.com, or userally.com are realistic. Rally was previously a project management tool (CA Rally, now part of Broadcom) which is a meaningful namespace concern in the PM space specifically.

**In context:**

- "We use Rally for our improvement projects" -- natural but collides with legacy CA Rally
- "Rally the team around this problem" -- excellent
- "Check the Rally board" -- clean
- "Rally Enterprise" -- works

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 1 | CA Rally (Broadcom) dominates PM searches |
| Brevity | 4 | Two syllables |
| Spellability | 5 | Common word |
| Personality | 5 | Energetic, human, motivating |
| Natural usage | 5 | Works beautifully as a verb |
| Fun + Enterprise | 4 | Great balance |
| **Total** | **24/30** | Disqualified by CA Rally collision |

---

### 2.4 Category B: Short Invented Words

4-5 letters, ownable in search, distinctive but not weird. The phonetic space occupied by Figma, Vercel, Vanta, Plaid, Retool.

---

#### Option 4: Pivra

**Meaning:** Invented. Evokes "pivot" (course correction, data-driven change) and has a Latin/Romance language feel (like "viva"). The "piv-" prefix immediately suggests pivoting -- changing direction based on evidence, which is core to process improvement.

**Domain plausibility:** pivra.com is likely available (coined word). pivra.io, pivra.app also realistic. Strong search ownability -- no existing use.

**In context:**

- "We use Pivra for our improvement projects" -- modern, professional
- "Powered by Pivra" -- strong
- "Check Pivra" -- clean
- "Pivra Enterprise" -- works well

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 5 | Coined word, fully ownable |
| Brevity | 4 | Two syllables |
| Spellability | 3 | Could be "Pivra" or "Pivera" -- needs clarification |
| Personality | 3 | Modern but slightly clinical |
| Natural usage | 2 | Hard to verb-ify |
| Fun + Enterprise | 3 | More enterprise than fun |
| **Total** | **20/30** | |

---

#### Option 5: Kasko

**Meaning:** Invented. Phonetically related to "cascade" (as in cascading improvements, cascade goals). Short, punchy, slightly playful. The hard K sounds give it energy and memorability. Could also evoke "cask" (a well-made container -- craftsmanship).

**Domain plausibility:** kasko.com may be taken (there is a European insurtech called KASKO). kasko.app or getkasko.com are plausible. Some namespace collision.

**In context:**

- "We use Kasko" -- memorable, distinctive
- "The Kasko board" -- clean
- "Kasko Enterprise" -- slightly informal but works
- "Powered by Kasko" -- decent

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 3 | European insurtech exists |
| Brevity | 4 | Two syllables |
| Spellability | 3 | "Kasko" vs "Casko" ambiguity |
| Personality | 4 | Punchy, memorable |
| Natural usage | 2 | Does not verb well |
| Fun + Enterprise | 3 | More fun than enterprise |
| **Total** | **19/30** | |

---

### 2.5 Category C: Names That Contain or Abbreviate to "PIPS"

Marc has an attachment to "PIPS" -- it is fun, it is memorable, and it means something (Process Improvement and Problem Solving). These options are designed so that "Pips" becomes the natural nickname.

---

#### Option 6: Pipstep

**Meaning:** PIPS + Step. Direct reference to both the methodology name and the 6-step process. The compound is tight and purposeful. People would naturally shorten it to "Pips" in conversation.

**Domain plausibility:** pipstep.com is likely available (not a common word). pipstep.io, pipstep.app also realistic. Strong search ownability.

**In context:**

- "We use Pipstep -- everyone just calls it Pips" -- natural
- "Check the Pipstep board" -- professional
- "Pips says we are on Step 3" -- casual, friendly
- "Pipstep Enterprise" -- credible

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 5 | Unique compound, fully ownable |
| Brevity | 4 | Two syllables |
| Spellability | 5 | Both words are simple |
| Personality | 4 | Has energy and directness |
| Natural usage | 4 | "Pips" as nickname works great |
| Fun + Enterprise | 4 | The formal name is professional, the nickname is fun |
| **Total** | **26/30** | |

---

#### Option 7: Pipspark

**Meaning:** PIPS + Spark. Suggests igniting improvement, sparking change. Longer but "Pips" drops out naturally. The "spark" element adds energy and optimism.

**Domain plausibility:** pipspark.com is very likely available. Strong ownability.

**In context:**

- "We use Pipspark" -- energetic
- "Everyone just calls it Pips" -- natural nickname
- "Spark an improvement project in Pips" -- verb potential through the "spark" element

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 5 | Unique, ownable |
| Brevity | 3 | Two syllables but 8 letters feels a touch long |
| Spellability | 4 | Clear but compound |
| Personality | 4 | Energetic, optimistic |
| Natural usage | 3 | Nickname "Pips" does the heavy lifting |
| Fun + Enterprise | 3 | Slightly informal |
| **Total** | **22/30** | |

---

### 2.6 Category D: Names from Craft/Making Domains

The "making things better" metaphor space. These names borrow from physical craft -- the idea that improvement is skilled work, not just checking boxes.

---

#### Option 8: Gauge

**Meaning:** A device for measuring; also to assess or evaluate. Perfect for a product centered on measurable improvement. "Gauge the impact." Suggests precision, measurement, and craft without being cold. Also evokes the 6-step evaluation cycle -- you gauge where you are, improve, and gauge again.

**Domain plausibility:** gauge.com is likely taken. gauge.app, gaugehq.com, or usegauge.com are realistic. Some collision with general measurement tools, but "Gauge project management" or "Gauge process improvement" would be ownable.

**In context:**

- "We use Gauge for our improvement projects" -- clean, professional
- "Gauge the results" -- perfect verb usage
- "Check the Gauge board" -- natural
- "Gauge Enterprise" -- solid
- "Powered by Gauge" -- strong

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 3 | Common word but "Gauge software" is ownable |
| Brevity | 5 | One syllable |
| Spellability | 4 | "Gauge" vs "gage" is a minor concern |
| Personality | 4 | Feels precise and crafted |
| Natural usage | 5 | "Gauge the impact" is perfect |
| Fun + Enterprise | 4 | Balanced -- precise but not cold |
| **Total** | **25/30** | |

---

#### Option 9: Forge

**Meaning:** To create through heat and pressure; to shape raw material into something strong. Process improvement is forging -- taking a rough process and hammering it into something that works. Also connects to the existing "ForgePIPS" brand, providing continuity.

**Domain plausibility:** forge.com is taken. forge.app may be available. forgehq.com, useforge.com are realistic. Collision with various "Forge" products exists but is manageable. The ForgePIPS brand already has "Forge" recognition.

**In context:**

- "We use Forge" -- strong, active
- "Forge a better process" -- excellent verb usage
- "Check the Forge board" -- clean
- "Forge Enterprise" -- powerful
- "Powered by Forge" -- sounds like infrastructure

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 2 | Many products named Forge exist |
| Brevity | 5 | One syllable |
| Spellability | 5 | Common English word |
| Personality | 5 | Strong, active, crafted |
| Natural usage | 5 | Perfect verb: "forge ahead," "forge a solution" |
| Fun + Enterprise | 4 | Energetic but substantial |
| **Total** | **26/30** | Search collision is the main risk |

---

### 2.7 Category E: PIPS Itself with a Rebrand Strategy

What if the answer is not a new name but a stronger _presentation_ of "PIPS"?

---

#### Option 10: PIPS (Rebranded)

**The case for keeping PIPS:**

The name PIPS has qualities that are genuinely hard to manufacture:

- It is 4 letters, one syllable
- It is memorable and fun -- Marc's instinct here is correct
- It stands for something meaningful (Process Improvement and Problem Solving)
- It already has brand equity (ForgePIPS, existing clients, RxLogic history)
- People smile when they hear it -- that is a real competitive advantage

The V1 guide dismissed PIPS primarily on three grounds: SEO collision (forex pips, Python pip), the name sounding "diminutive," and enterprise perception. Let us address each:

**SEO collision -- solvable.** "PIPS software," "PIPS process improvement," and "PIPS platform" are all ownable search terms. Slack has the same problem (slack = lazy) and it has not hurt them. Notion has the same problem (notion = vague idea) and it has not hurt them. The solution is great content marketing, a memorable domain, and product quality that generates organic search -- not a different name.

**Diminutive connotation -- reframeable.** "Pips" sounds small only if the visual identity around it is small. Pair PIPS with a strong visual system -- a deep, authoritative color palette, confident typography, and a sophisticated logo treatment -- and the name becomes a contrast that works in its favor. Slack sounds lazy. Figma sounds like nothing. The name is a container; the brand fills it.

**Enterprise perception -- testable.** Would a VP at a Fortune 500 be uncomfortable saying "We use PIPS"? Maybe. But would they be uncomfortable saying "We use Slack"? They were, until Slack proved its value. The name is not the barrier to enterprise adoption; the product, the pricing, the security posture, and the ROI story are.

**Rebranding strategy for PIPS:**

1. **Domain:** Secure pips.app (strong, modern TLD), usepips.com, or getpips.com as fallbacks
2. **Descriptor:** Always pair the name with a clear descriptor on first encounter: "PIPS -- Process Improvement Platform" or "PIPS -- Structured Problem Solving"
3. **Visual upgrade:** The name stays; everything around it levels up. Deep color palette, confident typography, sophisticated logo -- the visual system carries the enterprise weight
4. **The acronym becomes secondary:** Lead with the word "PIPS" not "P.I.P.S." Let it feel like a name, not an acronym. The meaning (Process Improvement and Problem Solving) lives in the "About" page and the methodology documentation, not in the logo
5. **Lean into the personality:** The name is fun. Own that. "PIPS" is the product your team actually wants to use, not the one IT mandates

**In context:**

- "We use PIPS" -- short, memorable
- "Check the PIPS board" -- natural
- "PIPS says we are on Step 3" -- casual, friendly
- "PIPS Enterprise" -- works (like "Slack Enterprise Grid")
- "Powered by PIPS" -- this only sounds weak if the brand around it is weak. With a strong visual identity, it works

**Evaluation:**
| Criterion | Score (1-5) | Notes |
|-----------|------------|-------|
| Searchability | 3 | Collision exists but "PIPS software" is ownable |
| Brevity | 5 | One syllable, four letters |
| Spellability | 5 | Universal |
| Personality | 5 | Memorable, fun, distinctive |
| Natural usage | 4 | Works as possessive and in casual speech |
| Fun + Enterprise | 4 | Fun naturally; enterprise through visual identity |
| **Total** | **26/30** | |

---

### 2.8 Ranking Summary

| Rank    | Name                 | Category         | Score | Key Strength                                      | Key Risk                                 |
| ------- | -------------------- | ---------------- | ----- | ------------------------------------------------- | ---------------------------------------- |
| 1       | **PIPS** (rebranded) | E: Rebrand       | 26/30 | Existing equity, memorable, fun, founder loves it | SEO collision, enterprise perception     |
| 2 (tie) | **Pipstep**          | C: Contains PIPS | 26/30 | Ownable, "Pips" as nickname, professional         | Compound word is slightly longer         |
| 2 (tie) | **Forge**            | D: Craft domain  | 26/30 | Perfect verb, strong energy, ForgePIPS continuity | Namespace collision                      |
| 4       | **Gauge**            | D: Craft domain  | 25/30 | Measurement metaphor, great verb                  | Common word, moderate search competition |
| 5 (tie) | **Notch**            | A: Verb-forward  | 25/30 | Punchy, perfect verb usage                        | Minecraft creator owns search            |
| 6       | **Hone**             | A: Verb-forward  | 24/30 | Craft feel, refinement metaphor                   | Existing Hone company                    |
| 7       | **Rally**            | A: Verb-forward  | 24/30 | Energetic, team-oriented                          | CA Rally disqualifies it                 |
| 8       | **Pipspark**         | C: Contains PIPS | 22/30 | Energetic, clear nickname                         | Slightly long                            |
| 9       | **Pivra**            | B: Invented      | 20/30 | Fully ownable search                              | Hard to spell, clinical feel             |
| 10      | **Kasko**            | B: Invented      | 19/30 | Punchy, memorable                                 | Spelling ambiguity, insurtech collision  |

### 2.9 Recommendation

**Primary recommendation: PIPS (rebranded)**

The strongest option is the one Marc already has. PIPS is memorable, it is fun, it means something, and it has existing brand equity. The V1 guide's mistake was trying to solve a visual identity problem with a naming change. PIPS does not need to be replaced -- it needs to be elevated. The right logo, the right color palette, and the right typography will make PIPS feel as credible as any name on this list.

The name "PIPS" has something that Meridian, Stepframe, and every coined word on this list lack: personality that did not have to be manufactured. Marc's instinct that there is something "fun" and "accessible" about it is correct, and that quality is a genuine competitive advantage in a market dominated by Jira, Asana, and monday.com.

**Secondary recommendation: Pipstep**

If Marc ultimately feels PIPS alone is too informal for enterprise positioning, Pipstep is the strongest alternative. It preserves the "Pips" nickname, adds the "step" methodology connection, and is fully ownable in search. The product would be "Pipstep" formally and "Pips" casually -- like how "Kubernetes" is formally Kubernetes but everyone says "K8s."

**The founder decides.** This guide presents the options and the analysis, but naming is ultimately a gut decision. Marc should say each name out loud 20 times, use it in sentences, imagine it on a business card and a login screen, and go with the one that feels right.

### 2.10 Name Usage Rules

_Note: These rules use "PIPS" as the product name per the primary recommendation. Adjust if the founder selects a different name._

**The product name:**

- Written as: **PIPS** (all caps -- it is an acronym, and this distinguishes it from the common English word)
- First reference in any document: "PIPS, the methodology-driven process improvement platform" (or similar descriptor)
- Subsequent references: just "PIPS"
- Never: "The PIPS," "Pips" (lowercase in product context), "P.I.P.S." (with periods)
- Domain reference: "pips.app" (or chosen domain) in URLs only, never in body text

**The methodology name:**

- Full name: **The PIPS Framework** or **The PIPS Methodology**
- First reference in context: "The PIPS Framework (Process Improvement and Problem Solving)"
- Subsequent references: "the framework," "the PIPS process," or "the 6-step process"
- The six steps: always referenced by number and name -- "Step 1: Identify," never just "Identify" or just "1"

### 2.11 Sub-Brand Naming Convention

**Product tiers:**

- PIPS Starter
- PIPS Professional
- PIPS Enterprise
- PIPS Unlimited

**Feature modules:**
Use functional, descriptive names (not branded sub-names):

- PIPS Ticketing
- PIPS Analytics
- PIPS Integrations
- PIPS API

**The PIPS steps within the product:**
Always use the step number + verb:

- Step 1: Identify
- Step 2: Analyze
- Step 3: Generate
- Step 4: Select & Plan
- Step 5: Implement
- Step 6: Evaluate

These steps are NOT given separate brand names. They are always referred to by their methodology names.

### 2.12 How the Name Works with White-Labeling

When a client white-labels the platform:

- The client's brand replaces "PIPS" everywhere in the UI
- "Powered by PIPS" appears in the footer (small, tasteful) -- and this works because the visual identity around it is strong
- The PIPS Framework methodology naming can remain intact or be renamed by the client
- Clients may optionally rename the methodology and the 6 step names at the Enterprise tier
- The 6 step names (Identify, Analyze, Generate, Select & Plan, Implement, Evaluate) are configurable at Enterprise tier

---

## 3. Visual Identity System

### 3.1 Color Palette

The V1 palette was built from Tailwind CSS defaults (slate-900, blue-800, cyan-500). That produces a product that looks like every other shadcn/Tailwind app shipping in 2026. V2 creates a palette that is distinctive, ownable, and immediately recognizable.

#### Design Philosophy

The palette is built on two principles:

1. **A warm indigo-violet primary** instead of standard blue. This is the single biggest visual differentiator. Blue is the default color of SaaS. Indigo-violet is adjacent enough to feel trustworthy and professional, but distinctive enough that a designer looks at the product and says "that is PIPS" not "that is another blue app." Think: the difference between Linear's purple-violet and Jira's blue. One feels intentional. The other feels default.

2. **The 6-step colors are the brand's visual signature.** Most competitors have one brand color plus gray. PIPS has a structured, purposeful 6-color system where each color means something specific. This is the visual expression of the methodology and the product's most distinctive visual asset.

#### Primary Colors

| Name            | Hex       | RGB          | HSL           | Usage                                                         |
| --------------- | --------- | ------------ | ------------- | ------------------------------------------------------------- |
| **PIPS Deep**   | `#1B1340` | 27, 19, 64   | 251, 54%, 16% | Primary brand color, dark backgrounds, headers, hero sections |
| **PIPS Indigo** | `#4F46E5` | 79, 70, 229  | 234, 74%, 59% | Primary action color, buttons, interactive elements, links    |
| **PIPS Violet** | `#7C3AED` | 124, 58, 237 | 262, 83%, 58% | Accent, highlights, CTAs, AI features, premium elements       |

**Rationale:** The deep-to-violet spectrum is distinctive without being alienating. Indigo (#4F46E5) sits between blue and purple -- it feels trustworthy like blue but memorable like purple. It is NOT a standard Tailwind color (Tailwind's indigo-600 is #4F46E5 but the surrounding palette and usage are custom). The deep navy-purple (#1B1340) provides the enterprise gravitas that pure purple would lack. The violet (#7C3AED) adds energy for accent moments.

**Why not blue?** Jira is blue. Asana is using more blue. ClickUp has blue tones. monday.com uses blue in their iconography. Notion's accent is near-blue. Going indigo-violet means PIPS is visually distinct from every major competitor on sight.

#### Secondary Colors

| Name           | Hex       | RGB           | HSL           | Usage                                                                    |
| -------------- | --------- | ------------- | ------------- | ------------------------------------------------------------------------ |
| **Warm Slate** | `#3D3654` | 61, 54, 84    | 254, 22%, 27% | Secondary text, borders, subtle backgrounds -- warmer than pure gray     |
| **Cloud**      | `#F0EDFA` | 240, 237, 250 | 254, 45%, 95% | Light backgrounds, hover states, subtle fills -- has a faint violet tint |
| **Ink**        | `#1E1B2E` | 30, 27, 46    | 249, 26%, 14% | Darkest text, dark mode surfaces                                         |

**Rationale:** The secondary palette is tinted with the primary indigo-violet hue rather than using pure blue-grays. This creates visual cohesion -- even the "gray" elements subtly belong to the PIPS color family.

#### The 6-Step Color System

Each of the 6 PIPS methodology steps owns a distinct color. This is the brand's most recognizable visual element -- a structured rainbow that means something. V2 fixes the V1 problem where Step 5 (Implement) was red, which collides with "error" semantics in UI.

| Step | Name              | Color Name       | Hex       | HSL           | Rationale                                                                                                                                                         |
| ---- | ----------------- | ---------------- | --------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Identify**      | Signal Blue      | `#2563EB` | 217, 91%, 53% | Blue for discovery and orientation -- finding where the problem is. Universally associated with "start here."                                                     |
| 2    | **Analyze**       | Insight Amber    | `#D97706` | 38, 92%, 44%  | Amber for investigation and scrutiny -- shining a light on root causes. Warm, attentive, focused.                                                                 |
| 3    | **Generate**      | Spark Green      | `#059669` | 160, 94%, 30% | Green for generative energy and growth -- new ideas emerging. Fresh, optimistic, creative.                                                                        |
| 4    | **Select & Plan** | Blueprint Indigo | `#4338CA` | 243, 58%, 51% | Indigo for planning and architecture -- structural decision-making. Thoughtful, deliberate.                                                                       |
| 5    | **Implement**     | Action Gold      | `#CA8A04` | 46, 93%, 40%  | Gold for execution and achievement -- getting things done and doing them well. Active, warm, reward-oriented. Gold means "go" not "stop."                         |
| 6    | **Evaluate**      | Loop Teal        | `#0891B2` | 189, 92%, 37% | Teal for evaluation and reflection -- completing the cycle. Calm, analytical, forward-looking. Connects visually back toward Step 1's blue, reinforcing the loop. |

**Why gold for Step 5 instead of red:** Red means "error," "stop," "danger," and "destructive action" in every UI system on the planet. Using red for the implementation step -- the step where teams are doing their most important work -- sends exactly the wrong signal. Gold means achievement, progress, and reward. It says "go build something great" not "something is wrong."

**Why teal for Step 6 instead of cyan:** The V1 cyan (#06B6D4) was too close to the primary accent, creating confusion between "this is a Step 6 element" and "this is an accent element." Teal (#0891B2) is deeper, more distinctive, and meets WCAG AA contrast on white backgrounds for normal text -- which cyan does not.

**Step color usage rules:**

- Step colors are used at 100% opacity for active steps and at 12% opacity for step backgrounds/cards
- In the circular PIPS diagram, each arc segment uses its step color
- In data visualizations, step colors denote which step a ticket or project is in
- Step colors do NOT replace the semantic colors (success/warning/error) -- they coexist
- In dark mode, step colors are brightened by approximately 15-20% for adequate contrast
- When all 6 colors appear together (Kanban board, pie chart, project list), the effect should feel like a purposeful spectrum, not a random rainbow. The colors are sequenced by hue to create a natural flow.

**Dark mode step colors:**

| Step             | Light Hex | Dark Hex  |
| ---------------- | --------- | --------- |
| 1. Identify      | `#2563EB` | `#60A5FA` |
| 2. Analyze       | `#D97706` | `#FBBF24` |
| 3. Generate      | `#059669` | `#34D399` |
| 4. Select & Plan | `#4338CA` | `#818CF8` |
| 5. Implement     | `#CA8A04` | `#FACC15` |
| 6. Evaluate      | `#0891B2` | `#22D3EE` |

#### Accent Colors

| Name               | Hex       | RGB          | HSL           | Usage                                                |
| ------------------ | --------- | ------------ | ------------- | ---------------------------------------------------- |
| **Signal Amber**   | `#F59E0B` | 245, 158, 11 | 38, 92%, 50%  | Warnings, attention states, highlight callouts       |
| **Signal Red**     | `#EF4444` | 239, 68, 68  | 0, 84%, 60%   | Error states, destructive actions, critical alerts   |
| **Signal Emerald** | `#10B981` | 16, 185, 129 | 160, 84%, 39% | Success states, positive indicators, completed items |

#### Neutral Palette

A 10-stop scale built on a violet-tinted base (not pure gray, not blue-gray) for visual cohesion with the primary palette.

| Name            | Hex       | Light Mode Usage                   | Dark Mode Usage      |
| --------------- | --------- | ---------------------------------- | -------------------- |
| **Neutral 50**  | `#FAFAFB` | Page background                    | --                   |
| **Neutral 100** | `#F3F2F7` | Card backgrounds, alternating rows | --                   |
| **Neutral 200** | `#E4E2ED` | Borders, dividers                  | --                   |
| **Neutral 300** | `#C9C6D9` | Disabled states, placeholder text  | --                   |
| **Neutral 400** | `#9A96B3` | Secondary text, icons              | --                   |
| **Neutral 500** | `#6E6989` | Body text (on white)               | --                   |
| **Neutral 600** | `#504B68` | Strong secondary text              | Body text (on dark)  |
| **Neutral 700** | `#3D3654` | Heading text                       | Secondary text       |
| **Neutral 800** | `#2A2440` | Primary text                       | Card backgrounds     |
| **Neutral 900** | `#1E1B2E` | Darkest text                       | Page background      |
| **Neutral 950** | `#110F1C` | --                                 | True dark background |

**Rationale:** Every gray has a subtle violet tint. This means even in the most "boring" parts of the UI -- borders, placeholder text, disabled states -- the PIPS color family is present. This is the difference between a color palette and a color _system_.

#### Semantic Colors

| Purpose     | Light Mode | Dark Mode | Usage                                                             |
| ----------- | ---------- | --------- | ----------------------------------------------------------------- |
| **Success** | `#059669`  | `#34D399` | Completed steps, success messages, positive metrics               |
| **Warning** | `#D97706`  | `#FBBF24` | At-risk items, approaching deadlines, caution states              |
| **Error**   | `#EF4444`  | `#FCA5A5` | Validation errors, failed actions, critical alerts                |
| **Info**    | `#4F46E5`  | `#818CF8` | Informational messages, tips, help text (uses the primary indigo) |

#### Color Usage Ratios

The palette follows a 60-30-10 distribution:

- **60% Neutrals:** Page backgrounds, card backgrounds, text. This is the canvas.
- **30% Primary (Deep + Indigo):** Headers, navigation, key structural elements. This is the frame.
- **10% Accent (Violet + Step colors + Semantic colors):** CTAs, active states, indicators, badges. This is the signal.

Never use accent colors for large background areas. Never use step colors as primary brand colors outside of step-specific contexts.

#### Accessibility (WCAG AA)

The following pairs meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text):

**Light mode:**

- Neutral 700 (`#3D3654`) on Neutral 50 (`#FAFAFB`) -- 9.8:1 (primary text)
- Neutral 500 (`#6E6989`) on Neutral 50 (`#FAFAFB`) -- 4.7:1 (secondary text)
- White (`#FFFFFF`) on PIPS Indigo (`#4F46E5`) -- 5.2:1 (buttons)
- White (`#FFFFFF`) on PIPS Deep (`#1B1340`) -- 15.8:1 (dark headers)
- Neutral 50 on PIPS Deep -- 14.9:1 (light text on dark)

**Dark mode:**

- Neutral 200 (`#E4E2ED`) on Neutral 900 (`#1E1B2E`) -- 11.4:1 (primary text)
- Neutral 400 (`#9A96B3`) on Neutral 900 (`#1E1B2E`) -- 4.9:1 (secondary text)
- White on PIPS Indigo (`#4F46E5`) -- 5.2:1 (buttons)

**Critical notes:**

- PIPS Violet (`#7C3AED`) achieves 4.6:1 on white -- AA compliant for normal text. Use it confidently.
- Step 5 Gold (`#CA8A04`) achieves 3.5:1 on white -- AA for large text only. For small text on white, darken to `#A16207`.
- Step 6 Teal (`#0891B2`) achieves 4.5:1 on white -- AA compliant for normal text. A significant improvement over V1's cyan.

#### White-Label Color Adaptation

When clients white-label the platform:

- **Primary colors** (Deep, Indigo, Violet) are replaced by the client's brand colors
- **Neutral palette** adapts its tint to match the client's primary hue (auto-generated)
- **Semantic colors** remain fixed (success/warning/error are universal)
- **Step colors** can be customized at the Enterprise tier. At lower tiers, they remain the PIPS defaults. If customized, the system validates WCAG contrast ratios automatically.
- The CSS custom property system (see Section 8) makes this swappable with a single theme file

### 3.2 Typography

#### Primary Typeface: DM Sans

**Headlines, labels, navigation, buttons, body text.**

[DM Sans](https://fonts.google.com/specimen/DM+Sans) is a geometric sans-serif from Colophon Foundry, available on Google Fonts. It has a distinctive character that Inter lacks -- slightly more geometric proportions, a wider aperture, and subtle quirks in letterforms (the lowercase 'a' and 'g' have character) that give it personality without sacrificing readability.

**Why DM Sans instead of Inter?**

Inter is an excellent typeface. It is also used by GitHub, Figma, Linear, Vercel, Supabase, and approximately half the SaaS products shipping in 2026. Using Inter is the typographic equivalent of using Tailwind blue -- it is a good default that says nothing about your brand.

DM Sans offers:

- **Distinctiveness:** It is used by fewer major products, giving PIPS a typographic identity
- **Geometric warmth:** Its shapes are clean and geometric (professional) but with slightly softer curves than Inter (approachable). This matches the "fun + enterprise" brand tension
- **Excellent screen readability:** Designed for digital use, large x-height, clear at all sizes
- **Optical sizing:** DM Sans has an optical size axis that automatically adjusts letterforms for different sizes -- tighter at display sizes, more open at text sizes
- **Complete character set:** Latin Extended support, all the weights needed
- **Free and open:** Available on Google Fonts under the Open Font License

**Weights used:**

- **DM Sans 400 (Regular):** Body text, form labels, descriptions
- **DM Sans 500 (Medium):** Navigation items, secondary buttons, table headers
- **DM Sans 600 (SemiBold):** Subheadings (H3-H6), button text, emphasis
- **DM Sans 700 (Bold):** Page headings (H1-H2), key statistics, strong emphasis

#### Display Typeface: DM Serif Display

**Hero headlines, marketing landing pages, feature sections, email headers.**

[DM Serif Display](https://fonts.google.com/specimen/DM+Serif+Display) is the serif companion to DM Sans, also from Colophon Foundry. Using a serif for display/marketing text and a sans-serif for product UI is a classic combination that creates visual hierarchy and gives the brand two distinct registers:

- **Marketing/editorial register (DM Serif Display):** Confident, editorial, authoritative. Used for hero headlines, landing page section headers, blog post titles, and pull quotes. This is the brand's "speaking from the stage" voice.
- **Product/functional register (DM Sans):** Clean, precise, actionable. Used for everything inside the product. This is the brand's "working alongside you" voice.

**Why a display serif?** It solves the "fun + enterprise" tension typographically. The serif carries authority and warmth (like a well-written editorial) while the sans-serif carries clarity and precision (like a well-designed tool). Together, they create a brand that feels both credible and human.

**Weights used:**

- **DM Serif Display 400 (Regular):** Hero headlines, marketing section headings, pull quotes

#### Monospace Typeface: JetBrains Mono

**Code blocks, API documentation, data tables with IDs, technical content.**

[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) has ligatures for common code sequences, excellent readability at small sizes, and a modern feel that complements DM Sans.

**Weights used:**

- **JetBrains Mono 400 (Regular):** Code blocks, inline code
- **JetBrains Mono 500 (Medium):** Code with emphasis, terminal commands

#### Type Scale

Based on a 1.250 ratio (Major Third) with a 16px base size:

| Element        | Size (px) | Size (rem) | Font             | Weight | Line Height | Letter Spacing | Usage                                        |
| -------------- | --------- | ---------- | ---------------- | ------ | ----------- | -------------- | -------------------------------------------- |
| **Display**    | 52px      | 3.25rem    | DM Serif Display | 400    | 1.1         | -0.02em        | Marketing hero headlines                     |
| **H1**         | 36px      | 2.25rem    | DM Sans          | 700    | 1.2         | -0.025em       | Page titles                                  |
| **H2**         | 28px      | 1.75rem    | DM Sans          | 700    | 1.25        | -0.02em        | Section headings                             |
| **H3**         | 22px      | 1.375rem   | DM Sans          | 600    | 1.3         | -0.015em       | Subsection headings                          |
| **H4**         | 18px      | 1.125rem   | DM Sans          | 600    | 1.4         | -0.01em        | Card headings, widget titles                 |
| **H5**         | 16px      | 1rem       | DM Sans          | 600    | 1.4         | 0              | Small section titles                         |
| **H6**         | 14px      | 0.875rem   | DM Sans          | 600    | 1.4         | 0.01em         | Overline text, category labels               |
| **Body Large** | 18px      | 1.125rem   | DM Sans          | 400    | 1.6         | 0              | Lead paragraphs, feature descriptions        |
| **Body**       | 16px      | 1rem       | DM Sans          | 400    | 1.6         | 0              | Default body text                            |
| **Body Small** | 14px      | 0.875rem   | DM Sans          | 400    | 1.5         | 0              | Secondary text, descriptions                 |
| **Caption**    | 12px      | 0.75rem    | DM Sans          | 500    | 1.4         | 0.02em         | Timestamps, metadata, helper text            |
| **Overline**   | 11px      | 0.6875rem  | DM Sans          | 600    | 1.4         | 0.08em         | Category labels, step indicators (uppercase) |

#### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

**CSS custom properties for typography:**

```css
:root {
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-display: 'DM Serif Display', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
```

### 3.3 Logo Concepts

All concepts are tied to the recommended name (PIPS). Each is described in enough detail for a designer to execute.

---

#### Concept A: "The Step Dots"

**Description:** The letters P-I-P-S in DM Sans 700, with six small colored dots arranged in a subtle arc above or below the wordmark. The dots use the 6 step colors (blue, amber, green, indigo, gold, teal) and represent the methodology's 6 steps. The dots are evenly spaced and follow a gentle curve that suggests forward motion and a cycle.

**Why it works:**

- **Warmth and approachability:** Dots are friendly, not intimidating. They have the same visual energy as confetti or seeds (pips). This satisfies Marc's "fun" requirement.
- **Conceptual depth:** Six dots = six steps. The arc suggests progression and the cycle. All of this communicates at a glance without needing explanation.
- **Competitive differentiation:** No competitor in the PM space uses dots-on-an-arc. Asana has three dots (stacked vertically). monday.com has a complex symbol. Jira has a diamond. Linear has an L-mark. This is distinct from all of them.
- **The word "pips" literally means dots/seeds.** The visual pun reinforces the name. Card pips, fruit pips, radar pips -- all are small dots or marks. The logo embodies the name.

**Typography treatment:** "PIPS" in DM Sans 700, letter-spacing 0.05em. The wider spacing gives the four letters room to breathe and feel more substantial. The dots sit in a gentle arc above the wordmark, centered.

**Color variations:**

- **Full color:** Six dots in step colors (left to right: blue, amber, green, indigo, gold, teal). "PIPS" in Neutral 800.
- **Monochrome dark:** Dots and text in PIPS Deep (#1B1340)
- **Monochrome light:** Dots and text in white (for dark backgrounds)
- **Single-color:** Dots and text in PIPS Indigo (for constrained contexts)

**Minimum sizes:**

- Full logo (dots + wordmark): 100px wide minimum
- Dots icon only: 20px minimum (at this size, dots may merge into a single arc stroke)
- Clear space: equal to the height of the "P" in the wordmark on all sides

**Favicon/app icon derivative:** The six dots arranged in a circle (or two rows of three) inside a rounded square with PIPS Deep background. Immediately recognizable at 16x16 because colored dots read clearly at small sizes.

**Assessment:** The strongest concept. It is fun, it is meaningful, it is distinctive, and it scales well. The dots give the brand a visual signature that works in every context -- from a favicon to a billboard.

---

#### Concept B: "The Pip Mark"

**Description:** A single, custom-drawn geometric mark that combines a "P" letterform with a visual reference to improvement/progress. The mark is a stylized P where the bowl of the P is replaced by an upward-curving arc with a small node at its peak -- suggesting a trajectory of improvement. The arc is rendered in PIPS Indigo, and a small step-colored dot sits at the apex.

**Why it works:**

- **Monogram strength:** A strong single-letter mark gives the brand a premium feel (think: Medium's M, Notion's N, Linear's L)
- **The arc suggests improvement:** The upward curve in the P's bowl visually communicates "getting better"
- **Scales beautifully:** A single mark works at every size, from 16px favicon to 200px hero

**Typography treatment:** The custom P mark followed by "IPS" in DM Sans 700, creating a seamless wordmark. Or the P mark used independently as an icon.

**Color variations:**

- **Full color:** P mark in PIPS Indigo with a step-colored dot, "IPS" in Neutral 800
- **Monochrome:** All in PIPS Deep
- **Reversed:** White on PIPS Deep background
- **Icon only:** The P mark alone in a rounded square

**Minimum sizes:**

- Full wordmark: 90px wide minimum
- P mark icon: 16px minimum
- Clear space: equal to the counter space inside the P on all sides

**Assessment:** Strong and premium. The risk is that a "P" monogram is not distinctive enough without expert execution (many companies start with P). Requires a skilled type designer to get right.

---

#### Concept C: "The Loop"

**Description:** An abstract mark that combines a circle (representing the continuous improvement cycle) with a subtle step-indicator. The circle is not closed -- it has a small gap at the top-right where the line trails off, suggesting "the cycle continues." Six small tick marks or notches on the circle's perimeter mark the 6 steps.

**Why it works:**

- **Directly represents the methodology:** The open circle with 6 marks IS the PIPS cycle
- **Unique in the PM space:** No major competitor uses an open-circle-with-notches mark
- **Conceptually elegant:** The gap in the circle says "this never ends -- you always improve"

**Typography treatment:** "PIPS" in DM Sans 700 to the right of the loop mark.

**Color variations:**

- **Full color:** Circle stroke in PIPS Indigo, 6 notch marks in their step colors, "PIPS" in Neutral 800
- **Monochrome:** All in PIPS Deep
- **Reversed:** White on PIPS Deep

**Minimum sizes:**

- Full logo: 120px wide minimum
- Loop icon only: 24px minimum (at small sizes, the 6 notches simplify to the open circle alone)
- Clear space: equal to the circle's radius on all sides

**Assessment:** Conceptually strong and visually clean. The risk is that circular marks are common in SaaS branding. The open gap and the 6 notches differentiate it, but execution needs to be sharp.

---

#### Logo Recommendation

**Primary recommendation: Concept A ("The Step Dots")**

Reasoning:

1. **Distinctiveness:** No competitor uses dots-on-an-arc. The colored dots are immediately recognizable and ownable.
2. **Name reinforcement:** "Pips" literally means dots/marks. The logo embodies the name in a way that feels natural, not forced.
3. **Fun + Enterprise balance:** The dots add warmth and playfulness. The clean typography adds professionalism. Together, they hit the exact tone the brand needs.
4. **Scalability:** Dots read clearly at every size, from favicon to billboard. The wordmark works independently. The dots work independently.
5. **The step colors shine:** The logo is the first place users encounter the 6-step color system. Seeing six distinct, purposeful colors in the logo primes them for the product experience.
6. **White-label compatibility:** The dots icon can be replaced with a client's mark while keeping the structural layout.

**Secondary recommendation:** Concept C ("The Loop") for use as a supplementary visual element within the product -- particularly for the step progress indicator, loading states, and analytics visualizations.

### 3.4 Signature Visual Elements

Beyond the logo, the brand has three signature visual elements that create consistency across all touchpoints:

#### 1. The Step Gradient Stripe

A thin horizontal bar (4px tall) that displays all 6 step colors in sequence, left to right. This is carried forward from V1 because it is genuinely distinctive and immediately recognizable.

**Usage:** Top of pages, bottom of hero sections, email headers, card dividers, presentation slides. It is the brand's "signature" -- like a racing stripe.

**Variants:**

- **Hard-edge:** Each color occupies exactly 1/6 of the width with no blending. Use for product UI.
- **Smooth gradient:** Colors blend into each other. Use for marketing materials where a softer feel is appropriate.

#### 2. The Dot Grid Pattern

A repeating pattern of small circles (3px diameter, 10% opacity of PIPS Indigo) at 32px intervals. The dots echo the "pips" name and the logo's dot motif.

**Usage:** Subtle background texture on hero sections, card backgrounds, empty state areas, presentation slides. Always at very low opacity (5-10%) so it creates texture without competing with content.

**Why this replaces the V1 "Meridian Grid":** The dot grid is directly tied to the brand name and logo concept. "Pips" are dots. The dot pattern reinforces this everywhere it appears, subconsciously. This is what makes a visual system feel _designed_ rather than _decorated_.

#### 3. The Step Pip Indicators

Six small colored circles (the "pips") used inline to indicate which step a project is in. These appear throughout the product: in sidebar navigation, table rows, card corners, and breadcrumbs.

**Design:** 8px circles filled with the step color, optionally with a 2px white border when placed on colored backgrounds. When showing all 6 (e.g., a project overview), they are arranged in a horizontal row with 4px gaps.

**Why this is a signature element:** It is unique to PIPS. No other product uses a row of 6 colored dots as a status indicator. It becomes a visual shorthand that users recognize instantly -- "I can see the 6 dots, so I know where this project stands."

### 3.5 Iconography

#### Icon Style

**Duotone** (outlined with a secondary fill color). This style combines the clarity of outlined icons with a subtle visual richness that distinguishes the product from the flat, single-weight icons used by most SaaS tools.

- **Primary stroke:** 1.5px, Neutral 700 (light mode) or Neutral 300 (dark mode)
- **Secondary fill:** 10-15% opacity of the relevant contextual color (step color, primary indigo, or semantic color)
- **Corner radius:** 2px on icon internals
- **Grid:** 24x24 base grid with 2px padding (20x20 live area)

#### Recommended Icon Library

**[Lucide](https://lucide.dev/)** as the base library.

Lucide is the actively-maintained successor to Feather Icons. It provides 1,400+ icons in a consistent 24x24 grid, MIT licensed, with React/Vue/Svelte components. Apply the duotone treatment on top of Lucide's outlined base.

#### Custom Icon Needs

**PIPS Step Icons (6 required):**

| Step             | Icon Concept            | Visual Description                                                                        |
| ---------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| 1. Identify      | Target/Crosshair        | A crosshair or target reticle with a central point -- "zeroing in on the problem"         |
| 2. Analyze       | Magnifying Glass + Root | A magnifying glass over a branching root structure -- "root cause analysis"               |
| 3. Generate      | Lightbulb Burst         | A lightbulb with radiating lines -- "ideas emerging"                                      |
| 4. Select & Plan | Checklist + Blueprint   | A document with checkmarks and a grid overlay -- "planning and selecting"                 |
| 5. Implement     | Wrench + Arrow          | A wrench with an upward arrow -- "building and executing" (not a rocket -- too startup-y) |
| 6. Evaluate      | Gauge + Loop            | A semicircular gauge with a return arrow -- "measuring and cycling back"                  |

#### Icon Sizing Grid

| Context               | Size                      | Touch Target |
| --------------------- | ------------------------- | ------------ |
| **Navigation**        | 20px                      | 40px         |
| **Toolbar/Actions**   | 20px                      | 36px         |
| **In-line with text** | 16px                      | --           |
| **Card icons**        | 24px                      | --           |
| **Feature icons**     | 32px                      | --           |
| **Hero/illustration** | 48-64px                   | --           |
| **Step indicators**   | 40px (within 48px circle) | 48px         |

### 3.6 Illustration & Imagery Style

#### Illustration Style: Geometric with Warmth

**Primary style:** Clean geometric illustrations built from simple shapes using the PIPS color palette -- but warmer than the typical "flat illustration" style. The key differentiator is the use of subtle gradients within shapes (not hard flat fills) and rounded, organic edges mixed with geometric structure.

**Characteristics:**

- Flat shapes with subtle inner gradients (PIPS Indigo to PIPS Violet, for example)
- Generous use of the step colors to create visual interest -- each illustration should use 2-3 step colors
- Dot motifs (echoing the logo and the "pips" name) used as decorative elements
- Rounded corners on all shapes (matching the 10px border radius of UI elements)
- Human figures are friendly geometric silhouettes with simple dot-heads -- not detailed, not corporate
- Background patterns use the Dot Grid at very low opacity

**When to use illustrations:**

- Marketing landing pages (hero sections, feature sections)
- Onboarding flows
- Empty states in the product
- Error pages (404, 500)
- Email headers
- Presentation slides

#### Photography Direction

Photography should be used sparingly and only for team/culture pages, case studies, and blog posts.

**Photo guidelines:**

- Desaturated slightly (reduce saturation 10-15%) to blend with the color palette
- Apply a subtle PIPS Deep overlay (5-8% opacity) for cohesion
- Avoid cliche stock photography (no pointing at screens, no fake laughter in meetings)
- Prefer: real work environments, whiteboards with actual content, people in thoughtful concentration
- Never use photos as hero backgrounds (use geometric illustration or solid color instead)

#### Data Visualization Style

- **Chart colors:** Use the 6 step colors as the primary data series palette. For additional series, use lighter/darker variants.
- **Chart backgrounds:** White (light mode) or Neutral 900 (dark mode). No colored backgrounds.
- **Grid lines:** Neutral 200 (light) or Neutral 800 (dark). Thin (1px), dashed for horizontal.
- **Labels:** Caption size (12px), Neutral 500 (light) or Neutral 400 (dark).
- **Tooltips:** Neutral 800 background, white text, 10px border radius, colored left border matching the data series.
- **Preferred chart types:** Bar charts, line charts, donut charts (for step distribution), sparklines. Avoid pie charts, 3D charts, and radar charts.
- **All-6-steps views:** When all 6 colors appear together (a donut chart showing project distribution by step), the colors read as a natural spectrum because they are sequenced by hue: blue, amber, green, indigo, gold, teal. This avoids the "random rainbow" effect that comes from arbitrary color assignment.

---

## 4. UI Design Language

### 4.1 Design Philosophy

The UI should feel like a well-organized workshop: everything has its place, the tools are sharp, and you can find what you need without thinking about it. It is information-dense (this is a productivity tool, not a marketing site) but never cluttered. Every pixel earns its place.

**Three principles:**

1. **Structure is visible.** The 6-step methodology should be spatially apparent. Users should always know where they are in the process.
2. **Color is functional.** Every color in the UI means something -- a step, a state, an action. Decorative color is minimal.
3. **Motion is purposeful.** Animations serve comprehension (showing a step advancing, a card moving) not decoration.

### 4.2 Component Styling

#### Border Radius Standard

| Element                  | Radius            | CSS Token       |
| ------------------------ | ----------------- | --------------- |
| Buttons (small)          | 6px               | `--radius-sm`   |
| Buttons (default)        | 10px              | `--radius-md`   |
| Cards, modals, dropdowns | 14px              | `--radius-lg`   |
| Large containers, panels | 18px              | `--radius-xl`   |
| Avatars, step indicators | 50% (full circle) | `--radius-full` |
| Input fields, selects    | 10px              | `--radius-md`   |
| Badges, tags             | 20px (pill shape) | `--radius-pill` |
| Tooltips                 | 10px              | `--radius-md`   |

**Design principle:** Slightly rounder than the industry standard 8px. The 10px default and pill-shaped badges give the UI a friendlier feel than the sharp-cornered enterprise norm, while the consistent system prevents it from feeling bubbly or juvenile. This is a conscious departure from the Tailwind/shadcn default of 8px -- it signals "we designed this on purpose, not from a template."

The pill-shaped badges and tags are particularly important: they echo the circular dot motifs in the logo and the step pip indicators, creating visual consistency between the brand identity and the product UI.

#### Shadow System (Elevation Levels)

| Level | Name    | CSS Value                                                               | Usage                                   |
| ----- | ------- | ----------------------------------------------------------------------- | --------------------------------------- |
| 0     | None    | `none`                                                                  | Inline elements, flat cards, table rows |
| 1     | Subtle  | `0 1px 3px rgba(27, 19, 64, 0.04), 0 1px 2px rgba(27, 19, 64, 0.03)`    | Cards at rest, input fields             |
| 2     | Low     | `0 2px 8px rgba(27, 19, 64, 0.06), 0 1px 3px rgba(27, 19, 64, 0.04)`    | Cards on hover, raised elements         |
| 3     | Medium  | `0 4px 16px rgba(27, 19, 64, 0.08), 0 2px 6px rgba(27, 19, 64, 0.04)`   | Dropdowns, popovers                     |
| 4     | High    | `0 8px 30px rgba(27, 19, 64, 0.12), 0 4px 10px rgba(27, 19, 64, 0.06)`  | Modals, command palette                 |
| 5     | Highest | `0 16px 50px rgba(27, 19, 64, 0.16), 0 8px 16px rgba(27, 19, 64, 0.06)` | Overlays, dialogs                       |

**Key difference from V1:** These shadows use the PIPS Deep color (`#1B1340`, rgb 27, 19, 64) as the shadow base instead of pure black. This gives shadows a very subtle violet tint that belongs to the PIPS color family. The effect is barely perceptible consciously but contributes to the overall "this feels designed" quality of the UI.

#### Spacing Scale

Based on a 4px grid:

| Token         | Value | Usage                                     |
| ------------- | ----- | ----------------------------------------- |
| `--space-0`   | 0px   | Reset                                     |
| `--space-0.5` | 2px   | Hairline gaps, icon-to-text micro spacing |
| `--space-1`   | 4px   | Tight padding (badges, tags)              |
| `--space-1.5` | 6px   | Small gaps within compact components      |
| `--space-2`   | 8px   | Standard inner padding, icon spacing      |
| `--space-3`   | 12px  | Default gap between related elements      |
| `--space-4`   | 16px  | Card inner padding, section spacing       |
| `--space-5`   | 20px  | Medium section gaps                       |
| `--space-6`   | 24px  | Standard card padding, content margins    |
| `--space-8`   | 32px  | Large section spacing                     |
| `--space-10`  | 40px  | Section divisions                         |
| `--space-12`  | 48px  | Major section spacing                     |
| `--space-16`  | 64px  | Page section spacing                      |
| `--space-20`  | 80px  | Hero/marketing section spacing            |
| `--space-24`  | 96px  | Maximum section spacing                   |

#### Card Styles

**Default Card:**

```
Background: White (light) / Neutral 800 (dark)
Border: 1px solid Neutral 200 (light) / Neutral 700 (dark)
Border radius: 14px
Padding: 24px
Shadow: Level 1 (subtle)
Hover: Shadow Level 2 (low), border color transitions to Neutral 300
```

**Interactive Card (clickable):**

```
Same as Default Card, plus:
Cursor: pointer
Hover: Shadow Level 2, slight translateY(-1px), border color PIPS Indigo at 25% opacity
Active: Shadow Level 1, translateY(0)
Transition: all 150ms ease
```

**Step Card (PIPS methodology step):**

```
Same as Default Card, plus:
Left border: 3px solid [step color]
Top-left corner: Small pip dot (8px circle) in step color
Step number: Inside the pip dot in white, DM Sans 600, 10px
Active step: Left border at 100% opacity, pip dot at full size (12px), subtle glow ring (step color at 15% opacity, 4px spread)
```

**Stat Card (dashboard metric):**

```
Background: White (light) / Neutral 800 (dark)
Border: 1px solid Neutral 200 / Neutral 700
Border radius: 14px
Padding: 20px
Metric value: H2 size, Neutral 800, DM Sans 700
Metric label: Caption size, Neutral 500
Trend indicator: Small arrow + percentage, colored by semantic (green up, red down)
Optional: Step Gradient Stripe along the bottom (2px) when the stat relates to the full methodology
```

#### Button Styles

**Primary Button:**

```
Background: PIPS Indigo (#4F46E5)
Text: White, DM Sans 600, 14px
Padding: 10px 20px
Border radius: 10px
Border: none
Hover: Background #4338CA (slightly deeper)
Active: Background #3730A3, scale(0.98)
Disabled: Background Neutral 300, text Neutral 500, cursor not-allowed
Focus: 2px offset ring in PIPS Violet at 50%
Transition: background 150ms ease, transform 100ms ease
```

**Secondary Button:**

```
Background: transparent
Text: Neutral 700 (light) / Neutral 200 (dark), DM Sans 600, 14px
Padding: 10px 20px
Border radius: 10px
Border: 1px solid Neutral 300 (light) / Neutral 600 (dark)
Hover: Background Cloud (#F0EDFA) (light) / Neutral 700 (dark), border Neutral 400
Active: Background Neutral 200 (light) / Neutral 600 (dark)
```

**Ghost Button:**

```
Background: transparent
Text: Neutral 600 (light) / Neutral 300 (dark), DM Sans 500, 14px
Padding: 10px 20px
Border radius: 10px
Border: none
Hover: Background Cloud (#F0EDFA) (light) / Neutral 800 (dark)
```

**Destructive Button:**

```
Background: Signal Red (#EF4444)
Text: White, DM Sans 600, 14px
Padding: 10px 20px
Border radius: 10px
Hover: Background #DC2626
Active: Background #B91C1C
Focus: 2px offset ring in Signal Red at 40%
```

**Button Sizes:**

| Size    | Padding   | Font Size | Min Height |
| ------- | --------- | --------- | ---------- |
| Small   | 6px 12px  | 13px      | 32px       |
| Default | 10px 20px | 14px      | 40px       |
| Large   | 12px 28px | 16px      | 48px       |

#### Input Field Styles

```
Background: White (light) / Neutral 800 (dark)
Border: 1px solid Neutral 300 (light) / Neutral 600 (dark)
Border radius: 10px
Padding: 10px 14px
Font: DM Sans 400, 14px, Neutral 800 (light) / Neutral 100 (dark)
Placeholder: Neutral 400
Height: 40px (single line), auto (textarea)

Focus: Border color PIPS Indigo, ring 2px PIPS Indigo at 20% opacity
Error: Border color Signal Red, ring 2px Signal Red at 20% opacity
Disabled: Background Neutral 100, text Neutral 400, cursor not-allowed

Label: DM Sans 500, 14px, Neutral 700 (light) / Neutral 200 (dark), margin-bottom 6px
Helper text: DM Sans 400, 12px, Neutral 500, margin-top 4px
Error text: DM Sans 400, 12px, Signal Red, margin-top 4px
```

#### Badge & Tag Styles

**Status Badge:**

```
Padding: 2px 10px
Font: DM Sans 500, 12px
Border radius: 20px (pill)
Variants:
  - Default: Background Neutral 100, text Neutral 600
  - Success: Background Emerald 50, text Emerald 700
  - Warning: Background Amber 50, text Amber 700
  - Error: Background Red 50, text Red 700
  - Info: Background Cloud (#F0EDFA), text PIPS Indigo
```

**Step Badge:**

```
Padding: 2px 10px
Font: DM Sans 600, 11px, uppercase, letter-spacing 0.05em
Border radius: 20px (pill)
Background: [step color] at 12% opacity
Text: [step color] at 100%
Optional: 6px pip dot before the text in the step color
```

**Tag (removable):**

```
Padding: 4px 10px (4px 14px with remove button)
Font: DM Sans 400, 13px
Border radius: 20px (pill)
Background: Cloud (#F0EDFA) (light) / Neutral 700 (dark)
Text: Neutral 700 (light) / Neutral 200 (dark)
Remove button: 16px circle, Neutral 400, hover Neutral 600
```

### 4.3 PIPS Step Visual System

The 6 PIPS steps are differentiated across the product through a consistent, multi-layered system. This is the product's most distinctive visual feature.

#### The Step Progress Bar

A horizontal progress bar at the top of every PIPS project view shows all 6 steps as connected nodes:

```
[1] -----> [2] -----> [3] -----> [4] -----> [5] -----> [6]
 o          o          o          o          o          o
```

- **Completed steps:** Filled circle (pip) in step color, checkmark icon inside, connector line colored
- **Current step:** Enlarged pip (pulsing subtle glow in step color at 20% opacity), step color at full intensity, step name visible below
- **Future steps:** Outlined pip in Neutral 300, gray connector
- **The pips are 12px circles** (completed/future) or 16px (active), maintaining the dot motif throughout

#### Step Cards in Board/Kanban View

When all 6 steps appear as columns in a Kanban board:

- Each column header has: Step number pip (colored dot), step name, card count
- The column header background uses the step color at 5% opacity -- enough to differentiate columns without creating a rainbow effect
- Cards within each column have a small pip dot (6px) in the column's step color in the top-right corner
- When a card is dragged between columns, it smoothly transitions its pip color to the destination step's color (200ms)
- **The overall effect:** A viewer from 10 feet away can see "there are 6 columns, each a different color, and cards move left to right." This immediately communicates "structured process" without reading a single word.

#### Step Colors in Pie/Donut Charts

When showing the distribution of projects across steps (a common dashboard widget):

- Use a donut chart (not pie -- donut is cleaner)
- Each segment uses its step color at 85% opacity
- Segments are ordered 1-6 clockwise from 12 o'clock
- The center of the donut shows the total project count
- Legend uses pip dots (6px colored circles) next to step names
- **The hue sequence** (blue, amber, green, indigo, gold, teal) creates a natural warm-to-cool-to-warm progression that reads as intentional, not random

#### Step Colors in Project Lists/Tables

When a table shows projects with their current step:

- A single pip dot (8px) in the step color appears in the "Step" column
- Optionally followed by the step number and abbreviated name: "3 - Generate"
- Do NOT color the entire row -- that creates visual overload in a long list
- The pip dot is the only step color element in the row

### 4.4 Layout Principles

#### Grid System

**12-column grid** with responsive behavior:

| Breakpoint  | Name         | Width      | Columns | Gutter | Margin |
| ----------- | ------------ | ---------- | ------- | ------ | ------ |
| < 640px     | Mobile       | 100%       | 4       | 16px   | 16px   |
| 640-768px   | Tablet Small | 100%       | 8       | 20px   | 24px   |
| 768-1024px  | Tablet       | 100%       | 12      | 20px   | 24px   |
| 1024-1280px | Desktop      | 100%       | 12      | 24px   | 32px   |
| 1280-1536px | Desktop Wide | 1280px max | 12      | 24px   | auto   |
| > 1536px    | Desktop XL   | 1440px max | 12      | 24px   | auto   |

#### Maximum Content Width

- **Marketing pages:** 1200px (up to 1440px with edge-to-edge backgrounds)
- **Product UI (with sidebar):** Sidebar 260px fixed + content area fluid (min 640px, max 1180px)
- **Product UI (content only):** 960px max width, centered
- **Documentation/text content:** 720px max width for readability

#### Sidebar Patterns

**Primary Sidebar (Left, Product Navigation):**

```
Width: 260px (collapsible to 60px icon-only mode)
Background: Neutral 50 (light) / Neutral 900 (dark)
Border: 1px solid Neutral 200 (light) / Neutral 800 (dark) on the right edge
Position: Fixed, full height
Contains: Logo, primary navigation, organization switcher, user avatar
Collapsible: Toggle via hamburger icon or Cmd/Ctrl + B
Mobile: Overlay from left, 280px wide, dismissible with scrim
```

### 4.5 Animation & Motion

#### Transition Standards

| Property                     | Duration | Easing                        | Usage                      |
| ---------------------------- | -------- | ----------------------------- | -------------------------- |
| Color, background, border    | 150ms    | ease                          | Hover states, focus states |
| Opacity                      | 200ms    | ease-out                      | Fade in/out                |
| Transform (scale, translate) | 200ms    | cubic-bezier(0.16, 1, 0.3, 1) | Slide in, pop, scale       |
| Width, height                | 250ms    | ease-in-out                   | Expand/collapse, accordion |
| Box-shadow                   | 150ms    | ease                          | Card hover elevation       |

#### Micro-Interactions

**Button press:** `scale(0.97)` on `:active`, 100ms, ease.

**Step progress advance:** The active pip scales up (1x to 1.3x) and pulses once with a glow ring in the step color. The connector line fills with color left-to-right over 300ms. The previous pip's scale returns to 1x and a checkmark fades in. This is the product's "signature moment" -- advancing a step should feel like an achievement.

**Pip dot transitions:** When a project moves steps (in a table or list), the pip dot cross-fades from the old step color to the new step color over 200ms. This reinforces the step-color system with motion.

**Toast notification:** Slides in from bottom-right, translateY(16px) to translateY(0), 300ms. Has a small colored pip dot matching the notification type (success = green, error = red, info = indigo).

#### Loading States

**Skeleton screens** are the primary loading pattern:

- Replace content areas with animated placeholder blocks
- Blocks are Neutral 200 (light) / Neutral 700 (dark) with a shimmer animation
- Shimmer uses a subtle left-to-right gradient sweep, repeating every 1.5s

**Full-page initial load:** The 6 step pip dots animate in sequence -- each dot appears and scales up, one after another (100ms apart), cycling through the step colors. This is a subtle, branded loading animation that takes about 600ms total.

**Motion philosophy:** Motion should be fast, functional, and nearly invisible. If a user notices the animation, it is too long or too dramatic. The one exception is the step-advance moment, which is allowed to be slightly more celebratory.

### 4.6 Post-MVP Component Patterns (v2.1)

> These component patterns were introduced in the post-MVP build phases (Knowledge Hub, Training Mode, Marketing pages). They extend the core design language from Sections 4.1-4.5 and must remain consistent with the existing token system.

#### 4.6.1 Cadence Bar [BUILT]

**Component:** `knowledge-cadence-bar.tsx`

The Cadence Bar is a contextual methodology learning widget that appears across multiple product surfaces (step-view, ticket detail, dashboard, Knowledge Hub). It is one of the product's most distinctive UX elements -- it bridges the gap between "work management tool" and "methodology learning platform."

**Visual Design:**

```
┌────────────────────────────────────────────────────┐
│  📖  PIPS Methodology · Step 2: Analyze            │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  45% read                  │
│                                                     │
│  Recommended reading:                               │
│  • Root Cause Analysis Fundamentals                 │
│  • When to Use the Fishbone Diagram                 │
│  • 5-Why Analysis Best Practices                    │
│                                                     │
│  [Expand to read →]                                │
└────────────────────────────────────────────────────┘
```

**Styling Tokens:**

- Background: `var(--color-surface-tinted)` (Cloud #F0EDFA in light mode)
- Border: `1px solid var(--color-border)` with step-color left border (3px)
- Border radius: `var(--radius-lg)` (14px)
- Padding: `var(--space-4)` (16px)
- Progress bar: Step-color fill on `var(--color-neutral-200)` track, height 4px, radius `var(--radius-full)`
- Content links: `var(--color-text-link)` (PIPS Indigo), hover underline
- Header icon: Book icon from Lucide, 16px, step color
- Section title: DM Sans 600, `var(--text-body-sm)`, step color text

**States:**

- **Collapsed:** Thin bar (40px height) showing step context + progress percentage + expand chevron. Uses `defaultCollapsed` prop.
- **Expanded:** Full panel (variable height) with content links and reading recommendations.
- **Empty/No context:** Hidden entirely (do not render an empty Cadence Bar).
- **Dark mode:** Surface tinted background uses `var(--color-surface-tinted)` which auto-adjusts.

**Behavior:**

- Collapsible via chevron toggle (state persisted in component state, not localStorage)
- Content links navigate to Knowledge Hub reader
- Progress updates reflect reading sessions tracked in DB
- Step color changes based on current context (matches the PIPS step being viewed)

**Placement Rules:**

- Dashboard: Below stat cards, above recent activity. Collapsed by default.
- Step View: Above the tool tabs area. Expanded on first visit per step (per user tracking is [PLANNED]).
- Ticket Detail: Below the ticket metadata panel. Collapsed by default.
- Knowledge Hub: In the landing page header area. Always expanded.

---

#### 4.6.2 Content Reader [BUILT]

**Component:** `content-reader.tsx`

The Content Reader renders methodology book content within the Knowledge Hub. It is the primary reading surface for the 205 content nodes and must feel like a high-quality reading experience -- not a wiki page.

**Visual Design:**

```
┌──────────┬──────────────────────────────────────────┐
│  TOC     │  Chapter 5: Root Cause Analysis           │
│          │                                            │
│  Ch 1    │  The most powerful question in process     │
│  Ch 2    │  improvement is "Why?" Not asked once,     │
│  Ch 3    │  not asked politely, but asked repeatedly  │
│ >Ch 5    │  until the true cause surfaces...          │
│  Ch 6    │                                            │
│  ...     │  [Bookmark ☆]                              │
│          │                                            │
│          │  ◄ Previous    Next ►                      │
└──────────┴──────────────────────────────────────────┘
```

**Styling Tokens:**

- Content area max width: `var(--text-max-width)` (720px) for optimal line length
- TOC sidebar: 220px fixed width, `var(--color-surface-secondary)` background
- TOC active item: `var(--color-primary)` text, `var(--color-primary-subtle)` background, 2px left border
- Content typography: Body text uses DM Sans 400, 16px, `var(--leading-loose)` (1.6 line height)
- Headings within content: DM Sans 700 (H2), DM Sans 600 (H3-H4), standard type scale
- Blockquotes: Left border 3px `var(--color-primary)`, `var(--color-surface-tinted)` background, italic
- Code blocks: `var(--font-mono)`, `var(--color-neutral-900)` background even in light mode
- Links within content: `var(--color-text-link)`, underline on hover
- Bookmark button: Star icon (Lucide), positioned top-right of content area. Unbookmarked: `var(--color-neutral-400)`. Bookmarked: `var(--color-signal-amber)` fill.
- Previous/Next navigation: Ghost button style, with chapter title preview

**Component:** `markdown-content.tsx`

- Renders markdown-to-HTML with consistent styling
- Applies PIPS typography tokens to all rendered elements
- Handles images, tables, code blocks, callouts within content

**Component:** `bookmark-button.tsx`

- Toggle bookmark state with optimistic UI update
- Star icon animation: scale 1 -> 1.2 -> 1 on bookmark (200ms, ease-spring)
- Server action to persist bookmark state

**Responsive Behavior:**

- Desktop: Two-column (TOC + content)
- Tablet: TOC collapses to hamburger menu at top
- Mobile: Full-width content, TOC as slide-out drawer

---

#### 4.6.3 Training UI Components [SCAFFOLDED]

The Training Mode introduces several new component patterns for structured learning. All components use the existing design token system and follow the same styling principles as core product components.

**Component: `training-landing.tsx`**

Training Mode landing page with path overview.

- Layout: Vertical stack of path cards
- Header: DM Sans 700, H1 size, "Master the PIPS Methodology"
- Progress summary: Overall completion ring + stats row
- Path cards: Use the Interactive Card style from Section 4.2, plus:
  - Left accent: Step-color-family gradient (each path maps to a step color range)
  - Progress ring in top-right corner
  - Module count and exercise count in caption text
  - Estimated duration badge (pill-shaped, `var(--radius-pill)`)

**Component: `training-module-card.tsx`**

Individual module card within a path.

```
┌───────────────────────────────────────────────┐
│  [3]  Understanding Root Cause Analysis        │
│                                                │
│  Learn the fundamentals of identifying why     │
│  problems really occur.                        │
│                                                │
│  5 exercises · ~20 minutes                     │
│                                                │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░  60% complete              │
│                                  [Continue →]  │
└───────────────────────────────────────────────┘
```

- Styling: Default Card style + sequence number badge (circular, step-color background, white text)
- Completed state: Checkmark overlay on number badge, green border accent
- Locked state: Opacity 50%, lock icon replacing number badge, no hover effect
- Progress bar: Same 4px style as Cadence Bar, step-color fill

**Component: `training-progress-ring.tsx`**

Circular progress indicator used throughout Training Mode.

- SVG-based circular progress with percentage text in center
- Sizes: Small (40px, used in cards), Medium (64px, used in path headers), Large (96px, used in progress page)
- Stroke: Step-color fill, `var(--color-neutral-200)` track
- Stroke width: 3px (small), 4px (medium), 5px (large)
- Center text: DM Sans 700, percentage value, `var(--color-text-primary)`
- Animation: Fill animates clockwise from 12 o'clock position on mount (300ms, ease-spring)

**Component: `training-exercise.tsx`**

Container component for all exercise types.

- Card-based layout with exercise type badge (pill, step-color)
- Exercise types: "Multiple Choice", "Scenario", "Reflection"
- Question/prompt: DM Sans 600, H3 size
- Submission: Primary button ("Submit Answer" / "Submit Reflection")
- Feedback area: appears below submission with green (correct) or amber (review) accent border

**Component: `training-multiple-choice.tsx`**

Multiple-choice exercise option cards.

- Options rendered as clickable cards (not radio buttons)
- Unselected: Default Card style, `var(--color-surface)` background
- Selected: `var(--color-primary-subtle)` background, `var(--color-primary)` border
- Correct (after submit): `var(--color-success-light)` background, `var(--color-success)` border, checkmark icon
- Incorrect (after submit): `var(--color-error-light)` background, `var(--color-error)` border, X icon
- Explanation text: Appears below options after submission, DM Sans 400, body-sm

**Component: `training-reflection.tsx`**

Open-ended reflection exercise.

- Prompt: DM Sans 600, body-lg
- Text area: Standard input field style, min-height 120px
- Character count: Caption text, bottom-right of text area
- After submission: "Expert perspective" expandable section appears

**Component: `scenario-runner.tsx`**

Interactive scenario exercise with branching decisions.

- Scenario description: Card with step-color left border
- Decision options: Interactive cards (same style as multiple-choice but with consequence preview on hover)
- Consequence reveal: Slide-in panel showing the result of the choice
- Multi-stage: Progress dots at top showing current stage position
- Summary: Final card with key learnings and PIPS methodology connection

---

#### 4.6.4 Marketing Landing Components [BUILT]

The marketing landing page system uses a distinct set of components that follow the "marketing register" (DM Serif Display headlines, larger spacing, more visual drama) while maintaining the same design tokens.

**Component: `landing-nav.tsx`**

Marketing page navigation bar.

- Height: 64px
- Background: Transparent on hero section, `var(--color-surface)` with `var(--shadow-subtle)` after scroll
- Logo: PIPS logo, 32px height
- Nav links: DM Sans 500, 14px, `var(--color-neutral-600)`, hover `var(--color-primary)`
- CTAs: "Sign In" (Ghost button), "Get Started" (Primary button, small size)
- Sticky on scroll with smooth background transition (200ms)
- Mobile: Hamburger menu at 768px breakpoint

**Component: `hero-section.tsx`**

Marketing hero section.

- Background: `var(--color-primary-deep)` (#1B1340) with Dot Grid pattern at 5% opacity
- Headline: DM Serif Display 400, Display size (52px), white text
- Subtitle: DM Sans 400, body-lg, `var(--color-neutral-300)` on dark background
- CTAs: "Start Free" (Primary button, large) + "See How It Works" (Ghost button, white text, large)
- Step Gradient Stripe: 4px, smooth variant, positioned at hero bottom as decorative divider
- Padding: `var(--space-24)` (96px) top and bottom
- Max content width: `var(--marketing-max-width)` (1200px)

**Component: `how-it-works-section.tsx`**

6-step methodology visual walkthrough.

- Background: `var(--color-surface)` (white)
- Section heading: DM Serif Display 400, H2 size, centered
- 6 step cards in horizontal row (desktop) or vertical stack (mobile)
- Each step card:
  - Pip dot (12px) in step color at top
  - Step number: Overline text style, step color
  - Step name: DM Sans 600, H4 size
  - Description: DM Sans 400, body-sm
  - Hover: slight elevation increase (shadow-low), translateY(-2px)
- Connected by thin line (1px, `var(--color-neutral-200)`) between cards
- Interactive: Click a step to reveal more detail (expand below card)

**Component: `features-section.tsx`**

Product feature showcase.

- Alternating left/right layout (text + screenshot mockup)
- Feature title: DM Serif Display 400, H3 size
- Feature description: DM Sans 400, body text
- Screenshot: Device frame mockup with 14px rounded corners and shadow-medium
- Step-color accent: small pip dot before the feature title
- Spacing: `var(--space-16)` (64px) between feature blocks

**Component: `methodology-section.tsx`**

Deeper methodology explanation with links.

- Builds on how-it-works but provides more detail
- Links to individual step pages and tool pages
- Uses step-color cards with expanded descriptions

**Component: `cta-section.tsx`**

Conversion call-to-action section.

- Background: `var(--color-primary-deep)` or `var(--color-surface-tinted)`
- Headline: DM Serif Display 400, centered, white (on deep) or primary text
- Single primary CTA button (large)
- Dot Grid pattern at 5% opacity for texture
- Padding: `var(--space-20)` (80px) vertical

**Component: `landing-footer.tsx`**

Marketing site footer.

- Step Gradient Stripe (hard-edge) above footer
- Background: `var(--color-neutral-900)` or `var(--color-primary-deep)`
- 4-column grid: Product, Resources, Company, Legal
- Column headers: DM Sans 600, caption size, white, uppercase, widest tracking
- Link items: DM Sans 400, body-sm, `var(--color-neutral-400)`, hover white
- Bottom bar: Logo (small, white), copyright, social links
- Padding: `var(--space-16)` (64px) top, `var(--space-8)` (32px) bottom

---

#### 4.6.5 SEO Component Patterns [BUILT]

Components that support the SEO marketing page infrastructure.

**Structured Metadata:**

- Every marketing page includes: title, description, keywords, Open Graph image, canonical URL
- JSON-LD schemas: Article (for tool/step pages), HowTo (for methodology steps), DefinedTerm (for glossary)
- Server-rendered content ensures full indexability

**Methodology Step Page Pattern:**

- Step-color accent used in page header and section dividers
- Step icon (custom Lucide-based) at 48px as hero element
- "Tools in this step" section with tool page cards
- Breadcrumb: Home > Methodology > Step N: [Name]
- Previous/Next step navigation at page bottom

**Tool Page Pattern:**

- Tool-specific hero with descriptive title
- "When to use this" / "How it works" / "Step-by-step" sections
- Connection to PIPS steps shown with pip dots
- CTA: "Use [tool name] in PIPS" with primary button

**Glossary Term Pattern:**

- Term as H1, definition as body-lg text
- Related terms as pill-shaped tag chips
- Cross-links to tool and step pages where term is relevant
- Minimal design -- content-forward, scannable

**Book Preview Pattern:**

- Chapter title in DM Serif Display (marketing register)
- Preview content uses Content Reader typography (body register)
- Gated content indicator: horizontal divider with lock icon and "Sign up to continue reading"
- Related chapters at bottom as small cards

---

## 5. Brand Application

### 5.1 Marketing Materials

#### Website / Landing Page Design Direction

**Hero Section:**

- Large headline (Display size, DM Serif Display 400): problem-focused statement, e.g., _"Every organization has problems. The best ones have a system for solving them."_
- Subtitle (Body Large, DM Sans 400, Neutral 500): one-sentence product description
- Two CTAs: "Start Free" (Primary button, PIPS Indigo) + "See How It Works" (Ghost button)
- Background: PIPS Deep (#1B1340) with subtle Dot Grid pattern at 5% opacity
- Visual element: The 6 step dots from the logo, enlarged to hero scale, with subtle floating animation
- Step Gradient Stripe runs across the bottom of the hero as a decorative divider

**Feature Sections:**

- Alternating left/right layout: screenshot on one side, text on the other
- Each feature section corresponds to one of the 6 PIPS steps (using the step color as the accent)
- H2 headline in DM Serif Display for marketing weight, body text in DM Sans
- Screenshot mockups in a device frame with 14px rounded corners and Level 3 shadow
- A single pip dot in the step color accompanies each step's section header

**Social Proof Section:**

- Logo row of customer organizations (when available)
- Pull quote from a customer in DM Serif Display 400 (italic feel through the serif)
- Background: Cloud (#F0EDFA), subtle Dot Grid pattern

**Pricing Section:**

- 3-4 columns: Starter, Professional, Enterprise, Contact Us
- The recommended tier has a PIPS Indigo top border accent and a "Most Popular" pill badge
- Clean, scannable feature comparison with pip-dot checkmarks in PIPS Indigo

**Footer:**

- 4-column layout: Product, Resources, Company, Legal
- Step Gradient Stripe above the footer
- PIPS logo (small) and tagline

#### Email Template Style

- Max width: 600px
- Background: White (outer: Neutral 100)
- Header: PIPS Deep bar with white logo, or white bar with PIPS Deep logo
- Step Gradient Stripe below the header (4px)
- Body: DM Sans (or system font fallback), 15px, Neutral 700
- CTA buttons: PIPS Indigo, white text, 10px radius
- Footer: Neutral 500 text, unsubscribe link, company info

#### Social Media Templates

**LinkedIn (1200x627):**

- Background: PIPS Deep or Cloud
- Large headline: DM Serif Display 400, white (on deep) or Neutral 800 (on cloud)
- PIPS logo in the top-left corner
- Step Gradient Stripe along the bottom edge
- One main message per image

**Twitter/X (1200x675):**

- Same principles as LinkedIn, more concise text
- Can use step colors more boldly as background accents

**Profile images:**

- The 6 step dots (from logo) arranged in a circle on PIPS Deep background
- Consistent across all platforms

#### Presentation Slide Style

- **Title slide:** PIPS Deep background, white headline in DM Serif Display, Step Gradient Stripe along the bottom, logo in corner
- **Content slides:** White background, Neutral 800 text in DM Sans, PIPS Indigo for emphasis
- **Section divider slides:** Step color background (full bleed), white text, step icon and pip dot
- **Chart slides:** White background, charts using step colors, minimal decoration
- **End slide:** PIPS Deep background, CTA, contact info, logo

#### Business Card Concept

- **Front:** PIPS Deep background. White logo (small, top-left). Name in DM Sans 600, white. Title in DM Sans 400, Neutral 300. Step Gradient Stripe along the bottom edge.
- **Back:** White background. Contact details in Neutral 700. Website in PIPS Indigo. Subtle Dot Grid pattern at very low opacity.
- **Finish:** Matte with spot UV on the Step Gradient Stripe for a tactile accent

### 5.2 Product UI

#### Login / Signup Page Design Direction

- **Layout:** Two-column on desktop (left: brand panel, right: form). Single column on mobile (form only, logo at top).
- **Brand panel (left):** PIPS Deep background, enlarged step dots floating with subtle parallax animation, customer testimonial rotating at the bottom. The dot grid pattern at 8% opacity creates depth.
- **Form panel (right):** White background, centered form (max-width 380px).
- **Form fields:** Email, password, "Sign In" primary button, "Create Account" link, SSO options (Google, Microsoft, SAML).
- **Step Gradient Stripe** runs across the very top of the page (4px).

#### Dashboard Look and Feel

The dashboard is the product's command center -- organized, information-dense, but not overwhelming.

- **Top bar:** White (light) / Neutral 900 (dark). Breadcrumbs left, search center, notifications and avatar right. 56px tall.
- **Left sidebar:** 260px, Neutral 50 (light) / Neutral 900 (dark). Organization name and switcher at top. Navigation groups: Home, My Work, PIPS Projects, General Tickets, Team, Analytics, Settings. Each PIPS project shows its current step with a pip dot.
- **Main content area:** White (light) / Neutral 950 (dark). Stat cards at the top (4 across). Step distribution donut chart + trending line chart below. Recent activity feed.
- **General feel:** Clean, spacious, data-forward. Step colors provide visual landmarks without creating a rainbow effect. The pip dots throughout create a subtle, consistent visual rhythm.

#### Navigation Style

**Primary: Left sidebar.**

Sidebar navigation structure (v2.1 — updated with Knowledge Hub and Training):

```
[Logo / Org Name]
[Org Switcher Dropdown]
---
Home (Dashboard)
My Work
---
PIPS Projects
  - Active
  - Completed
  - Templates
General Tickets
---
Team
  - Members
  - Groups
---
LEARN                     ← v2.1 addition
  Knowledge Hub           ← [BUILT]
  Training                ← [SCAFFOLDED]
---
Analytics
  - Dashboards
  - Reports
---
Integrations
Settings
  - Organization
  - Billing
  - White-Label
  - API Keys
---
Help & Support
```

**Navigation item styling:**

- Default: DM Sans 400, 14px, Neutral 600 (light) / Neutral 400 (dark)
- Hover: Background Cloud (light) / Neutral 800 (dark), text Neutral 800 / Neutral 100
- Active: Background PIPS Indigo at 10%, text PIPS Indigo, 3px left border in PIPS Indigo
- Group headers: Overline style (DM Sans 600, 11px, Neutral 400, uppercase, letter-spacing 0.06em)

#### Empty States

Every empty state follows a consistent pattern:

- Centered layout within the content area
- Custom geometric illustration (120-160px) incorporating pip dots and step colors
- H4 headline in DM Sans + Body Small description + Primary CTA button
- The illustration uses the relevant step color if the empty state is within a step context

Examples:

- **No PIPS projects:** "Start your first improvement project. Every great improvement begins with a well-defined problem." [Create Project]
- **No tickets in this step:** "Nothing in Analyze yet. Move a project here when you are ready to dig into root causes." [Learn About This Step]
- **No team members:** "Build your team. Invite colleagues to collaborate on improvement projects." [Invite Members]

#### Error Pages

**404 Page:**

- The 6 step dots from the logo, but with one dot missing (a gap in the sequence)
- H1: "Page not found"
- Body: "This page does not exist or has been moved. But hey, every good process starts with identifying the problem."
- CTAs: "Go to Dashboard" (Primary), "Contact Support" (Ghost)

**500 Page:**

- The 6 step dots, all dimmed to Neutral 300 (suggesting the system is paused)
- H1: "Something went wrong"
- Body: "We are working on it. Please try again in a moment."
- CTA: "Try Again" (Primary), "Check Status" (Ghost)

### 5.3 Documentation

#### Docs Site Style

- **Layout:** Three-column: left sidebar (navigation), center (content, 720px max), right sidebar (on-this-page TOC).
- **Background:** White (light) / Neutral 950 (dark)
- **Typography:** DM Sans for all text. JetBrains Mono for code blocks.
- **Navigation:** Organized by category (Getting Started, PIPS Methodology, Ticketing, Integrations, API Reference, Admin).
- **Search:** Prominent search bar at top of sidebar.
- **Code blocks:** Neutral 900 background (even in light mode), syntax highlighting. Copy button top-right.
- **Callouts:** Info (PIPS Indigo left border), Warning (Amber left border), Error (Red left border), Tip (Green left border).
- **Step Gradient Stripe** across the top of the docs site.

---

## 6. Brand Guidelines Summary

### 6.1 The "Do" and "Do Not" List

#### DO:

- Use PIPS in all caps (it is an acronym)
- Refer to the methodology as "The PIPS Framework" or "The PIPS Methodology"
- Use step colors only in step-specific contexts
- Use pip dots (small colored circles) as step indicators throughout the UI
- Maintain adequate contrast ratios (WCAG AA minimum)
- Use DM Sans for product UI and body text
- Use DM Serif Display for marketing headlines and editorial content
- Lead with outcomes and benefits in marketing copy
- Use the Step Gradient Stripe as a signature brand element
- Use the Dot Grid pattern as a subtle background texture
- Keep illustrations geometric with warmth (subtle gradients, rounded edges)
- Use skeleton screens for loading states
- Let whitespace breathe
- Test all color combinations for accessibility before shipping
- Use pill-shaped badges and tags (20px radius)
- Use the Cadence Bar for contextual methodology content across all PIPS step surfaces (v2.1)
- Use the Content Reader typography for all rendered book/guide content -- 720px max width, DM Sans 400, 1.6 line height (v2.1)
- Use the training-progress-ring for all circular progress indicators in Training Mode (v2.1)
- Use the marketing register (DM Serif Display headlines) on all public-facing marketing pages (v2.1)
- Ensure marketing page CTAs use Primary button styling consistently (v2.1)

#### DO NOT:

- Never write "Pips" in body text (always PIPS -- it is an acronym)
- Never use "The PIPS" with a definite article before the product name
- Never stretch, rotate, or distort the logo
- Never use step colors as primary brand colors outside of step contexts
- Never use step colors for error, warning, or success states (use semantic colors)
- Never use red/coral for Step 5 -- it is gold
- Never use pure black (#000000) or pure gray -- always use the violet-tinted neutral scale
- Never use pie charts, 3D charts, or radar charts in data visualizations
- Never use stock photos as hero backgrounds
- Never use more than 3 step colors in a single UI element (unless showing all 6 in a progress bar or chart)
- Never use animation durations longer than 350ms for UI interactions (except step-advance, which is allowed 500ms)
- Never use Inter, Helvetica, or Arial -- the brand typeface is DM Sans
- Never use a colored background behind the full-color logo (use the monochrome version)
- Never use the word "synergy," "leverage" (as a verb), "ideate," or "paradigm" in brand communications
- Never place the logo smaller than its minimum size (100px for full logo, 20px for dots icon)
- Never render Cadence Bar when there is no contextual content -- hide it entirely (v2.1)
- Never use the marketing register (DM Serif Display) inside the product UI except in the Knowledge Hub book title rendering (v2.1)
- Never create training exercise components that bypass the training-exercise.tsx container component (v2.1)
- Never render Knowledge Hub content without the Content Reader typography styles (v2.1)

### 6.2 Common Misuse Examples

| Misuse                                             | Problem                                 | Correct Usage                                                         |
| -------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| "Welcome to the PIPS"                              | Definite article not used with the name | "Welcome to PIPS"                                                     |
| "Pips helps teams..."                              | Lowercase in body text                  | "PIPS helps teams..."                                                 |
| Using Step 5 color (gold) as a button color        | Step colors are not UI action colors    | Use PIPS Indigo for buttons                                           |
| Using red (#EF4444) for Step 5: Implement          | Red = error in UI semantics             | Step 5 is Action Gold (#CA8A04)                                       |
| Rainbow gradient using all 6 step colors in a card | Overuse of step colors                  | Use one step color per context, or all 6 only in progress bars/charts |
| Using pure gray (#6B7280) for text                 | Breaks the violet-tinted neutral system | Use Neutral 500 (#6E6989)                                             |
| Inter font in the product                          | Wrong typeface                          | DM Sans for all product text                                          |
| Spinner for page loading                           | Inconsistent with brand patterns        | Use skeleton screens or pip-dot animation                             |
| Logo on a busy photo background                    | Reduces legibility                      | Logo on solid or near-solid backgrounds only                          |
| "Powered by PIPS" in tiny gray text                | Undermines the badge                    | "Powered by PIPS" with adequate size and contrast                     |

### 6.3 Brand Asset Checklist

The following assets need to be created by a designer based on this guide:

- [ ] Primary logo (Step Dots) in SVG, PNG (1x, 2x, 3x)
- [ ] Logo variations: full color, monochrome dark, monochrome light, single-color
- [ ] Favicon: 16x16, 32x32, 180x180 (Apple Touch), SVG -- using the 6 dots in circular arrangement
- [ ] App icon: 512x512 PNG, 1024x1024 PNG, SVG
- [ ] Social media avatars: 400x400 for all platforms
- [ ] OG image template: 1200x630
- [ ] 6 PIPS Step icons (custom, following icon guidelines)
- [ ] Step Gradient Stripe asset (SVG, CSS gradient)
- [ ] Dot Grid pattern (SVG, CSS)
- [ ] Empty state illustrations (8 minimum: no projects, no tickets, no team, no data, no results, 404, 500, onboarding)
- [ ] Email header template
- [ ] Social media post templates (LinkedIn, Twitter/X)
- [ ] Presentation template (Google Slides / PowerPoint)
- [ ] Business card layout (print-ready)
- [ ] Documentation site header/favicon
- [ ] Loading animation (pip dots cycling through step colors)
- [ ] Step-advance celebration animation
- [ ] Figma component library with all tokens, components, and patterns
- [ ] Cadence Bar component variants (collapsed, expanded, per-step context) (v2.1)
- [ ] Content Reader layout template (TOC + content + bookmark) (v2.1)
- [ ] Training progress ring variants (40px, 64px, 96px) (v2.1)
- [ ] Training module card states (active, completed, locked) (v2.1)
- [ ] Training exercise type badges (Multiple Choice, Scenario, Reflection) (v2.1)
- [ ] Marketing page hero section template (v2.1)
- [ ] Marketing page feature section alternating layout template (v2.1)
- [ ] Glossary term page layout template (v2.1)
- [ ] Book preview gated content divider illustration (v2.1)

### 6.4 Quick Reference Card

```
PIPS — Brand Quick Reference
=================================

NAME:        PIPS (the platform and the methodology)
STANDS FOR:  Process Improvement and Problem Solving
TAGLINE:     Structured improvement. Measurable results.

PRIMARY COLORS:
  Deep     #1B1340    (dark backgrounds, headers)
  Indigo   #4F46E5    (buttons, links, actions)
  Violet   #7C3AED    (accents, highlights, AI features)

STEP COLORS:
  1. Identify       #2563EB  (Signal Blue)
  2. Analyze        #D97706  (Insight Amber)
  3. Generate       #059669  (Spark Green)
  4. Select & Plan  #4338CA  (Blueprint Indigo)
  5. Implement      #CA8A04  (Action Gold) -- NOT red
  6. Evaluate       #0891B2  (Loop Teal)

FONTS:
  Display:    DM Serif Display 400  (marketing headlines)
  Headlines:  DM Sans 700
  Body:       DM Sans 400
  Code:       JetBrains Mono 400

KEY ELEMENTS:
  Border radius:    10px (default), 14px (cards), 20px (pills)
  Shadows:          5 levels, violet-tinted (not pure black)
  Spacing:          4px grid
  Max content:      720px (text), 960px (product), 1200px (marketing)
  Signature:        Step Gradient Stripe, Dot Grid, Pip Dot indicators

POST-MVP COMPONENTS (v2.1):
  Cadence Bar:      Contextual methodology widget (step-view, dashboard, tickets)
  Content Reader:   Book/guide content rendering (720px max, DM Sans 400, 1.6 LH)
  Training Ring:    Circular SVG progress (40/64/96px sizes, step-color fill)
  Module Card:      Training module with sequence number + progress bar
  Landing Nav:      Marketing nav (transparent→solid on scroll, 64px)
  Hero Section:     PIPS Deep bg + Dot Grid + Step Stripe divider
  Bookmark Button:  Star icon toggle (amber when bookmarked)

VOICE:
  Direct, Substantive, Guiding, Confident, Human, Inclusive

COMPETITIVE POSITION:
  Methodology-driven like Rhythm Systems
  Approachable and modern like Notion/Linear
  No competitor occupies this quadrant

DO NOT FORGET:
  - Step 5 is GOLD not red
  - Neutrals are violet-tinted, not pure gray
  - DM Sans, not Inter
  - Pill-shaped badges (20px radius)
  - "PIPS" always all caps in text
  - Skeleton screens for loading, not spinners
  - Cadence Bar uses step-color left border for context (v2.1)
  - Content Reader max-width is 720px (v2.1)
  - Marketing pages use DM Serif Display headlines (v2.1)
  - Training progress rings use step-color fills (v2.1)
```

---

## 7. White-Label Considerations

### 7.1 Customizable Elements

When a client white-labels the PIPS platform, the following elements are customizable:

**Always customizable (all tiers):**

- Organization name and logo (replaces "PIPS" in the sidebar and header)
- Primary brand color (replaces PIPS Indigo)
- Accent color (replaces PIPS Violet)
- Favicon and app icon
- Login page brand panel content (logo, background color, tagline)
- Email template header (logo, colors)

**Customizable at Professional tier:**

- Custom domain (CNAME mapping: e.g., improve.clientname.com)
- Secondary brand color
- Custom login page illustration/image
- "Powered by PIPS" badge can be recolored (but not removed)

**Customizable at Enterprise tier:**

- Full color palette override (all brand colors)
- Custom font (with fallback to DM Sans)
- Neutral palette hue-shift (auto-generated from primary color)
- PIPS step color override (with accessibility validation)
- PIPS step name override (rename the 6 steps to match client terminology)
- PIPS methodology name override (rename "The PIPS Framework" entirely)
- "Powered by PIPS" badge can be removed entirely
- Custom email domain for transactional emails
- Custom terms of service and privacy policy links

### 7.2 Fixed Elements (Structural, Not Branded)

These elements remain constant across all white-label instances:

- Neutral palette structure (10-stop scale) -- the hue can shift but the luminance steps are fixed
- Semantic colors (success, warning, error, info) -- these are universal
- Typography scale (sizes, line heights, spacing ratios)
- Spacing scale (4px grid)
- Border radius values
- Shadow system structure (5 levels)
- Animation timing and easing
- Layout structure (sidebar + content area, grid system)
- Icon library (Lucide base set)
- Responsive breakpoints
- Accessibility features (contrast validation, keyboard navigation, ARIA)
- PIPS methodology content and logic (the 6-step framework itself, unless overridden at Enterprise)

### 7.3 Theming Architecture

White-label theming is implemented entirely through CSS custom properties (design tokens):

```
Base tokens (PIPS defaults)
  |-- Overridden by: Organization theme (stored in database)
  |     |-- Primary color -> generates derived colors automatically
  |     |-- Accent color -> generates derived colors automatically
  |     |-- Logo URL
  |     |-- Optional: neutral hue shift (auto-calculated from primary)
  |     +-- Optional: step colors, font, etc.
  +-- Applied via: CSS custom property injection at page load
```

**Technical implementation:**

1. On login, the server looks up the organization's theme settings from the database
2. A `<style>` tag is injected into the `<head>` that overrides the default CSS custom properties
3. All components reference tokens, never hard-coded colors
4. The system auto-generates derived colors (hover states, focus rings, text-on-color, neutral hue-tint) from the primary and accent colors using HSL manipulation

**Example theme override:**

```css
/* Client theme: "Acme Corp" */
:root {
  --color-primary: #7c3aed; /* Acme's purple */
  --color-primary-hover: #6d28d9;
  --color-primary-light: #a78bfa;
  --color-primary-subtle: rgba(124, 58, 237, 0.1);
  --color-accent: #f59e0b; /* Acme's gold */
  --color-accent-hover: #d97706;
  --color-surface-tint: 263; /* Hue for neutral tinting */
  --font-brand: 'Poppins', var(--font-sans); /* Enterprise tier only */
}
```

### 7.4 Step Color Adaptation

When Enterprise clients customize the 6 step colors:

1. **Validation:** The system checks each custom color for WCAG AA contrast against both the light and dark background colors. If a color fails, the system suggests a corrected version.
2. **Derived colors:** For each step color, the system automatically generates:
   - A 12% opacity background variant (for step cards)
   - A dark-mode brightened variant
   - A text-safe variant (darkened if necessary for text usage)
3. **Fallback:** If a client provides only a partial set, remaining steps use the PIPS defaults.
4. **Preview:** The admin settings page includes a live preview showing custom step colors in the step progress bar, step cards, and a sample donut chart before saving.

### 7.5 "Powered by PIPS" Badge

**Design:**

- Text: "Powered by PIPS" in DM Sans 400, 11px, Neutral 400
- Optional: Small pip dots (4px, step colors) to the left of the text
- Placement: Footer of the application, right-aligned
- Minimum margin: 16px from any other element
- Link: Clicks through to the PIPS marketing site

**Tier behavior:**

- Starter / Professional: Badge is always present. Can be recolored to match client theme but not hidden.
- Enterprise: Badge can be removed entirely as part of the license agreement.

**Design constraints:**

- The badge must never be overlaid on a busy background
- Minimum contrast of 3:1 against its background
- Never modify the badge text (no "Built with PIPS" or "Running on PIPS")

---

## 8. CSS Design Tokens

The complete token system that implements this brand. Copy this directly into your global CSS.

### 8.1 Light Mode (Default)

```css
:root {
  /* ============================================
     COLORS -- PRIMARY
     ============================================ */
  --color-primary-deep: #1b1340;
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  --color-primary-active: #3730a3;
  --color-primary-light: #818cf8;
  --color-primary-subtle: rgba(79, 70, 229, 0.1);
  --color-accent: #7c3aed;
  --color-accent-hover: #6d28d9;
  --color-accent-light: #a78bfa;
  --color-accent-subtle: rgba(124, 58, 237, 0.1);

  /* ============================================
     COLORS -- SECONDARY
     ============================================ */
  --color-warm-slate: #3d3654;
  --color-cloud: #f0edfa;
  --color-ink: #1e1b2e;

  /* ============================================
     COLORS -- SIGNAL / SEMANTIC
     ============================================ */
  --color-signal-amber: #f59e0b;
  --color-signal-amber-subtle: rgba(245, 158, 11, 0.1);
  --color-signal-red: #ef4444;
  --color-signal-red-subtle: rgba(239, 68, 68, 0.1);
  --color-signal-emerald: #10b981;
  --color-signal-emerald-subtle: rgba(16, 185, 129, 0.1);

  --color-success: #059669;
  --color-success-light: #d1fae5;
  --color-success-subtle: rgba(5, 150, 105, 0.1);
  --color-warning: #d97706;
  --color-warning-light: #fef3c7;
  --color-warning-subtle: rgba(217, 119, 6, 0.1);
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-subtle: rgba(239, 68, 68, 0.1);
  --color-info: #4f46e5;
  --color-info-light: #eef2ff;
  --color-info-subtle: rgba(79, 70, 229, 0.1);

  /* ============================================
     COLORS -- NEUTRALS (violet-tinted)
     ============================================ */
  --color-neutral-50: #fafafb;
  --color-neutral-100: #f3f2f7;
  --color-neutral-200: #e4e2ed;
  --color-neutral-300: #c9c6d9;
  --color-neutral-400: #9a96b3;
  --color-neutral-500: #6e6989;
  --color-neutral-600: #504b68;
  --color-neutral-700: #3d3654;
  --color-neutral-800: #2a2440;
  --color-neutral-900: #1e1b2e;
  --color-neutral-950: #110f1c;

  /* ============================================
     COLORS -- PIPS STEP COLORS
     ============================================ */
  --color-step-1: #2563eb; /* Identify -- Signal Blue */
  --color-step-1-subtle: rgba(37, 99, 235, 0.12);
  --color-step-2: #d97706; /* Analyze -- Insight Amber */
  --color-step-2-subtle: rgba(217, 119, 6, 0.12);
  --color-step-3: #059669; /* Generate -- Spark Green */
  --color-step-3-subtle: rgba(5, 150, 105, 0.12);
  --color-step-4: #4338ca; /* Select & Plan -- Blueprint Indigo */
  --color-step-4-subtle: rgba(67, 56, 202, 0.12);
  --color-step-5: #ca8a04; /* Implement -- Action Gold */
  --color-step-5-subtle: rgba(202, 138, 4, 0.12);
  --color-step-6: #0891b2; /* Evaluate -- Loop Teal */
  --color-step-6-subtle: rgba(8, 145, 178, 0.12);

  /* ============================================
     COLORS -- SURFACE (Semantic aliases)
     ============================================ */
  --color-bg: var(--color-neutral-50);
  --color-bg-secondary: #ffffff;
  --color-surface: #ffffff;
  --color-surface-secondary: var(--color-neutral-100);
  --color-surface-tinted: var(--color-cloud);
  --color-border: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);
  --color-text-primary: var(--color-neutral-800);
  --color-text-secondary: var(--color-neutral-500);
  --color-text-tertiary: var(--color-neutral-400);
  --color-text-inverse: #ffffff;
  --color-text-link: var(--color-primary);
  --color-text-link-hover: var(--color-primary-hover);

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-display: 'DM Serif Display', Georgia, 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', Consolas, monospace;

  /* Font sizes */
  --text-display: 3.25rem; /* 52px */
  --text-h1: 2.25rem; /* 36px */
  --text-h2: 1.75rem; /* 28px */
  --text-h3: 1.375rem; /* 22px */
  --text-h4: 1.125rem; /* 18px */
  --text-h5: 1rem; /* 16px */
  --text-h6: 0.875rem; /* 14px */
  --text-body-lg: 1.125rem; /* 18px */
  --text-body: 1rem; /* 16px */
  --text-body-sm: 0.875rem; /* 14px */
  --text-caption: 0.75rem; /* 12px */
  --text-overline: 0.6875rem; /* 11px */

  /* Font weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.2;
  --leading-normal: 1.4;
  --leading-relaxed: 1.5;
  --leading-loose: 1.6;

  /* Letter spacing */
  --tracking-tighter: -0.025em;
  --tracking-tight: -0.015em;
  --tracking-normal: 0;
  --tracking-wide: 0.01em;
  --tracking-wider: 0.02em;
  --tracking-widest: 0.08em;

  /* ============================================
     SPACING
     ============================================ */
  --space-0: 0px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* ============================================
     BORDER RADIUS
     ============================================ */
  --radius-none: 0px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-pill: 20px;
  --radius-full: 9999px;

  /* ============================================
     SHADOWS (violet-tinted)
     ============================================ */
  --shadow-none: none;
  --shadow-subtle: 0 1px 3px rgba(27, 19, 64, 0.04), 0 1px 2px rgba(27, 19, 64, 0.03);
  --shadow-low: 0 2px 8px rgba(27, 19, 64, 0.06), 0 1px 3px rgba(27, 19, 64, 0.04);
  --shadow-medium: 0 4px 16px rgba(27, 19, 64, 0.08), 0 2px 6px rgba(27, 19, 64, 0.04);
  --shadow-high: 0 8px 30px rgba(27, 19, 64, 0.12), 0 4px 10px rgba(27, 19, 64, 0.06);
  --shadow-highest: 0 16px 50px rgba(27, 19, 64, 0.16), 0 8px 16px rgba(27, 19, 64, 0.06);

  /* ============================================
     ANIMATION
     ============================================ */
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-slow: 250ms;
  --duration-slower: 350ms;
  --duration-step-advance: 500ms;

  --ease-default: ease;
  --ease-in-out: ease-in-out;
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ============================================
     LAYOUT
     ============================================ */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 60px;
  --topbar-height: 56px;
  --content-max-width: 960px;
  --text-max-width: 720px;
  --marketing-max-width: 1200px;

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-sidebar: 30;
  --z-overlay: 40;
  --z-modal: 50;
  --z-toast: 60;
  --z-tooltip: 70;

  /* ============================================
     PIP DOT SIZES (signature element)
     ============================================ */
  --pip-sm: 6px;
  --pip-md: 8px;
  --pip-lg: 12px;
  --pip-xl: 16px;

  /* ============================================
     BREAKPOINTS (for reference -- use in media queries)
     ============================================ */
  /* --breakpoint-sm: 640px;   */
  /* --breakpoint-md: 768px;   */
  /* --breakpoint-lg: 1024px;  */
  /* --breakpoint-xl: 1280px;  */
  /* --breakpoint-2xl: 1536px; */
}
```

### 8.2 Dark Mode Overrides

```css
[data-theme='dark'],
.dark,
@media (prefers-color-scheme: dark) {
  :root {
    /* ============================================
       SURFACE OVERRIDES
       ============================================ */
    --color-bg: var(--color-neutral-950);
    --color-bg-secondary: var(--color-neutral-900);
    --color-surface: var(--color-neutral-800);
    --color-surface-secondary: var(--color-neutral-900);
    --color-surface-tinted: rgba(79, 70, 229, 0.08);
    --color-border: var(--color-neutral-700);
    --color-border-strong: var(--color-neutral-600);
    --color-text-primary: var(--color-neutral-100);
    --color-text-secondary: var(--color-neutral-400);
    --color-text-tertiary: var(--color-neutral-500);
    --color-text-inverse: var(--color-neutral-900);
    --color-text-link: var(--color-primary-light);
    --color-text-link-hover: var(--color-accent-light);

    /* ============================================
       SEMANTIC COLOR OVERRIDES
       ============================================ */
    --color-success: #34d399;
    --color-success-light: rgba(52, 211, 153, 0.15);
    --color-warning: #fbbf24;
    --color-warning-light: rgba(251, 191, 36, 0.15);
    --color-error: #fca5a5;
    --color-error-light: rgba(252, 165, 165, 0.15);
    --color-info: #818cf8;
    --color-info-light: rgba(129, 140, 248, 0.15);

    /* ============================================
       STEP COLOR OVERRIDES (Brightened for dark BG)
       ============================================ */
    --color-step-1: #60a5fa; /* Identify -- lighter blue */
    --color-step-1-subtle: rgba(96, 165, 250, 0.15);
    --color-step-2: #fbbf24; /* Analyze -- lighter amber */
    --color-step-2-subtle: rgba(251, 191, 36, 0.15);
    --color-step-3: #34d399; /* Generate -- lighter green */
    --color-step-3-subtle: rgba(52, 211, 153, 0.15);
    --color-step-4: #818cf8; /* Select & Plan -- lighter indigo */
    --color-step-4-subtle: rgba(129, 140, 248, 0.15);
    --color-step-5: #facc15; /* Implement -- lighter gold */
    --color-step-5-subtle: rgba(250, 204, 21, 0.15);
    --color-step-6: #22d3ee; /* Evaluate -- lighter teal */
    --color-step-6-subtle: rgba(34, 211, 238, 0.15);

    /* ============================================
       SHADOW OVERRIDES (Increased opacity for dark)
       ============================================ */
    --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-low: 0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15);
    --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
    --shadow-high: 0 8px 30px rgba(0, 0, 0, 0.3), 0 4px 10px rgba(0, 0, 0, 0.2);
    --shadow-highest: 0 16px 50px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}
```

### 8.3 Signature Element CSS

```css
/* Step Gradient Stripe -- hard edge (product UI) */
.step-gradient-stripe {
  height: 4px;
  width: 100%;
  background: linear-gradient(
    to right,
    var(--color-step-1) 0%,
    var(--color-step-1) 16.67%,
    var(--color-step-2) 16.67%,
    var(--color-step-2) 33.33%,
    var(--color-step-3) 33.33%,
    var(--color-step-3) 50%,
    var(--color-step-4) 50%,
    var(--color-step-4) 66.67%,
    var(--color-step-5) 66.67%,
    var(--color-step-5) 83.33%,
    var(--color-step-6) 83.33%,
    var(--color-step-6) 100%
  );
}

/* Step Gradient Stripe -- smooth (marketing) */
.step-gradient-stripe-smooth {
  height: 4px;
  width: 100%;
  background: linear-gradient(
    to right,
    var(--color-step-1),
    var(--color-step-2),
    var(--color-step-3),
    var(--color-step-4),
    var(--color-step-5),
    var(--color-step-6)
  );
}

/* Dot Grid Pattern */
.dot-grid {
  background-image: radial-gradient(
    circle at center,
    var(--color-primary) 1.5px,
    transparent 1.5px
  );
  background-size: 32px 32px;
  opacity: 0.06;
}

/* Pip Dot -- step indicator */
.pip-dot {
  width: var(--pip-md);
  height: var(--pip-md);
  border-radius: var(--radius-full);
  background-color: var(--step-color);
  display: inline-block;
  flex-shrink: 0;
}

.pip-dot--sm {
  width: var(--pip-sm);
  height: var(--pip-sm);
}
.pip-dot--lg {
  width: var(--pip-lg);
  height: var(--pip-lg);
}
.pip-dot--xl {
  width: var(--pip-xl);
  height: var(--pip-xl);
}

/* Pip dot with glow (active step) */
.pip-dot--active {
  width: var(--pip-xl);
  height: var(--pip-xl);
  box-shadow: 0 0 0 4px var(--step-color-subtle);
  animation: pip-pulse 2s ease-in-out infinite;
}

@keyframes pip-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px var(--step-color-subtle);
  }
  50% {
    box-shadow: 0 0 0 8px var(--step-color-subtle);
  }
}

/* Loading animation -- pip dots cycling */
.pip-loading {
  display: flex;
  gap: 6px;
  align-items: center;
}

.pip-loading .pip-dot {
  animation: pip-load 1.2s ease-in-out infinite;
}

.pip-loading .pip-dot:nth-child(1) {
  animation-delay: 0ms;
}
.pip-loading .pip-dot:nth-child(2) {
  animation-delay: 100ms;
}
.pip-loading .pip-dot:nth-child(3) {
  animation-delay: 200ms;
}
.pip-loading .pip-dot:nth-child(4) {
  animation-delay: 300ms;
}
.pip-loading .pip-dot:nth-child(5) {
  animation-delay: 400ms;
}
.pip-loading .pip-dot:nth-child(6) {
  animation-delay: 500ms;
}

@keyframes pip-load {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### 8.4 Utility Classes

```css
/* Typography utilities */
.text-display {
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: var(--weight-regular);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}
.text-h1 {
  font-family: var(--font-sans);
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tighter);
}
.text-h2 {
  font-family: var(--font-sans);
  font-size: var(--text-h2);
  font-weight: var(--weight-bold);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
}
.text-h3 {
  font-family: var(--font-sans);
  font-size: var(--text-h3);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-tight);
}
.text-h4 {
  font-family: var(--font-sans);
  font-size: var(--text-h4);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
}
.text-h5 {
  font-family: var(--font-sans);
  font-size: var(--text-h5);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-normal);
}
.text-h6 {
  font-family: var(--font-sans);
  font-size: var(--text-h6);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-wide);
}
.text-body-lg {
  font-family: var(--font-sans);
  font-size: var(--text-body-lg);
  font-weight: var(--weight-regular);
  line-height: var(--leading-loose);
}
.text-body {
  font-family: var(--font-sans);
  font-size: var(--text-body);
  font-weight: var(--weight-regular);
  line-height: var(--leading-loose);
}
.text-body-sm {
  font-family: var(--font-sans);
  font-size: var(--text-body-sm);
  font-weight: var(--weight-regular);
  line-height: var(--leading-relaxed);
}
.text-caption {
  font-family: var(--font-sans);
  font-size: var(--text-caption);
  font-weight: var(--weight-medium);
  line-height: var(--leading-normal);
}
.text-overline {
  font-family: var(--font-sans);
  font-size: var(--text-overline);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

/* Color utilities */
.text-primary {
  color: var(--color-text-primary);
}
.text-secondary {
  color: var(--color-text-secondary);
}
.text-tertiary {
  color: var(--color-text-tertiary);
}
.text-brand {
  color: var(--color-primary);
}
.text-accent {
  color: var(--color-accent);
}

.bg-page {
  background-color: var(--color-bg);
}
.bg-surface {
  background-color: var(--color-surface);
}
.bg-surface-secondary {
  background-color: var(--color-surface-secondary);
}
.bg-surface-tinted {
  background-color: var(--color-surface-tinted);
}
.bg-brand {
  background-color: var(--color-primary-deep);
}

/* Step color utilities */
.step-1 {
  --step-color: var(--color-step-1);
  --step-color-subtle: var(--color-step-1-subtle);
}
.step-2 {
  --step-color: var(--color-step-2);
  --step-color-subtle: var(--color-step-2-subtle);
}
.step-3 {
  --step-color: var(--color-step-3);
  --step-color-subtle: var(--color-step-3-subtle);
}
.step-4 {
  --step-color: var(--color-step-4);
  --step-color-subtle: var(--color-step-4-subtle);
}
.step-5 {
  --step-color: var(--color-step-5);
  --step-color-subtle: var(--color-step-5-subtle);
}
.step-6 {
  --step-color: var(--color-step-6);
  --step-color-subtle: var(--color-step-6-subtle);
}

/* Animation utilities */
.transition-colors {
  transition:
    color var(--duration-normal) var(--ease-default),
    background-color var(--duration-normal) var(--ease-default),
    border-color var(--duration-normal) var(--ease-default);
}
.transition-shadow {
  transition: box-shadow var(--duration-normal) var(--ease-default);
}
.transition-transform {
  transition: transform var(--duration-normal) var(--ease-spring);
}
.transition-all {
  transition: all var(--duration-normal) var(--ease-default);
}
```

---

## Appendix: Design Decision Log

| Decision           | V1 Choice                          | V2 Choice                    | Rationale for Change                                                                                                                                             |
| ------------------ | ---------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name               | Meridian                           | PIPS (rebranded)             | Founder rejected Meridian. PIPS has personality, existing equity, and the "fun" quality Marc wants. Visual identity carries the enterprise weight.               |
| Primary color      | Blue (#1E40AF) -- Tailwind default | Indigo (#4F46E5)             | Blue is the default color of SaaS. Indigo-violet is adjacent but distinctive. The product should not look like every other Tailwind app.                         |
| Step 5 color       | Red/Coral (#DC2626)                | Gold (#CA8A04)               | Red = error in UI semantics. Gold = achievement, progress, execution.                                                                                            |
| Step 6 color       | Cyan (#06B6D4)                     | Teal (#0891B2)               | Cyan failed WCAG AA on white for normal text. Teal passes. Also reduces confusion with the accent color.                                                         |
| Neutral palette    | Blue-tinted (Tailwind slate)       | Violet-tinted (custom)       | Neutrals should belong to the same color family as the primary. Violet tinting creates visual cohesion.                                                          |
| Shadow color       | Pure black                         | PIPS Deep (#1B1340) tinted   | Violet-tinted shadows feel more designed and cohesive.                                                                                                           |
| Primary font       | Inter                              | DM Sans                      | Inter is ubiquitous. DM Sans has similar quality but more personality (geometric warmth) and less market saturation.                                             |
| Display font       | None (Inter for everything)        | DM Serif Display             | Adding a serif for marketing/editorial creates visual hierarchy and carries authority. Solves the "fun + enterprise" tension typographically.                    |
| Border radius      | 8px default                        | 10px default, pill badges    | Slightly rounder = friendlier. Pill-shaped badges echo the circular pip-dot motif. Both signal "designed on purpose, not from a template."                       |
| Logo direction     | Meridian Arc (tied to "Meridian")  | Step Dots (tied to "PIPS")   | Dots = pips. The logo embodies the name. Dots are fun, distinctive, and scale well. No competitor uses this approach.                                            |
| Brand archetype    | Sage + Hero                        | Removed                      | Archetype frameworks rarely translate to actionable design decisions. Replaced with concrete competitive positioning and the "Fun + Enterprise" tension section. |
| Signature elements | Step Gradient Stripe only          | Stripe + Dot Grid + Pip Dots | Three signature elements create more opportunities for brand recognition. All three are tied to the "pips" concept.                                              |

---

### v2.1 Additions (Post-MVP)

| Decision                              | Approach                                            | Rationale                                                                                                                                                                                                                                                                                        |
| ------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cadence Bar placement                 | Step-view, dashboard, ticket detail, Knowledge Hub  | The Cadence Bar is the primary bridge between "doing work" and "learning methodology." Placing it on multiple surfaces ensures discoverability without requiring users to navigate to the Knowledge Hub. Customer Insights Report identifies Cadence Bar click-through as a key adoption metric. |
| Content Reader typography             | 720px max-width, DM Sans 400, 1.6 line height       | Follows established reading research for optimal line length (60-80 characters). Matches product body text register (not marketing register) because users are reading inside the authenticated product.                                                                                         |
| Training progress ring vs. linear bar | Circular SVG ring                                   | Rings are more space-efficient in cards and grid layouts. They echo the circular pip-dot motif from the logo. Linear bars are reserved for inline progress (Cadence Bar, module cards).                                                                                                          |
| Marketing register separation         | DM Serif Display for marketing, DM Sans for product | Creates clear visual separation between "public-facing" and "authenticated" experiences. Marketing pages feel editorial and authoritative. Product UI feels clean and functional.                                                                                                                |
| Gated content pattern                 | Preview + divider + CTA                             | Book preview pages show ~20% of content to demonstrate quality, then gate the rest behind signup. This is a proven SaaS content marketing pattern that balances SEO value with conversion pressure.                                                                                              |

---

_This brand guide is a living document. It should be updated as the product evolves, as user research provides new insights, and as the brand matures in market. Review quarterly._
