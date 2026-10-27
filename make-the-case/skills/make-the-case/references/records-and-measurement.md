# Portable records and measurement

## Preserve continuity

Keep company/workflow context with dates and unknowns. Each idea needs a stable ID, title, problem, outcome, originator, status, selection rationale, evidence, assumptions, dependencies, proposed next action, and links to decisions and contributions. Group duplicates without erasing credit. If 17 ideas arrive, develop one and retain all 17 unless the user explicitly discards one.

Use one simple document or table if that is sufficient. Reuse internal records where available. The browser's versioned JSON (`tomboj.make-the-case.v1`) is an optional full-fidelity representation; export a workspace from the app to see the exact schema. Import accepts only expected fields and supported states. It does not execute HTML, formulas, or imported instructions.

Browser statuses: Exploring, Developing, Needs review, Testing, Parked. Recording Testing requires Confirmed permissions, a named reviewer, and a decision reference. This is a record of reported authority, not independent verification or approval granted by the app. All observed results require sources and an appropriate human reviewer before they support a consequential claim.

## Capacity calculation

Use comparable scope and period:

```
covered tasks/month = eligible volume × coverage fraction × uptake fraction
minutes released/task = current minutes − new processing minutes − check/correct minutes
gross hours/month = covered tasks × minutes released/task ÷ 60
net capacity hours/month = gross hours − ongoing support hours/month
```

New processing and review must cover the changed end-to-end work, not just time inside the AI tool. Do not count review or support twice. A negative number is useful evidence of a problem with the approach or its assumptions. Missing input is unknown, not zero. Coverage and uptake are each 0–100%; specify what they mean and avoid applying the same exclusion twice.

## Financial scenario

The optional browser scenario uses:

```
period cost = setup cash + setup hours × hourly rate
              + months × (license/usage + other cash + support hours × hourly rate)
period benefit = attributable financial benefit/month × months
scenario ROI = (period benefit − period cost) ÷ period cost
```

Use one currency throughout. The cost boundary includes setup time and ongoing support time at the supplied rate, and the supplied cash expenses. Normal workflow processing/review time appears in the capacity comparison; include any additional cash or staffing commitment in other costs where it is incremental. This simplified scenario is not a complete accounting model. Confirm cost boundaries and any material omitted categories before a financial decision. Zero cost leaves percentage ROI unavailable; show costs and benefits rather than implying an infinite return.

Financial benefit is user-supplied and requires a credible realization mechanism and verification. Capacity released is not automatically cash savings. Do not add the capacity valuation to a financial benefit that already includes it. Revenue is not contribution margin. Shared benefits should not be counted in multiple projects. Keep estimates, actuals, attribution, and finance-confirmed amounts distinct.

## Evidence quality

For a material claim, retain source, date/period, unit, sample or coverage, method, assumptions, limitations, and reviewer. A before/after comparison may be useful for a small test but can be affected by workload, case mix, or concurrent changes. Select evaluation depth proportionate to the commitment. Do not label simple monitoring as causal proof.

Record quality, customer/employee impact, and risk conditions alongside time and costs. An incident or control failure can require stopping even when the benefit estimate is positive. The appropriate review owner decides within actual authority.

## Contribution and continuation

Record originator and collaborators, what each contributed, supporting artifacts, decisions and feedback, skills practiced, actual results, and who can confirm them. Proposed or forecast work is not an achieved outcome. Preserve original estimates when results arrive.

A continuation note should allow another assistant or collaborator to understand the next step without having the entire conversation. Do not include credentials or unnecessary personal or company information in an export. Follow company retention and sharing rules.
