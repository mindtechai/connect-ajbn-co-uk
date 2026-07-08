## 1. Events section — update Members' Evening
`src/components/landing/EventsSection.tsx`: replace the AJBN Members' Evening `description` with:
> "6:30 PM – 9:00 PM | Vyman House, 104 College Rd, Harrow, HA1 1BQ. Hosted by Vyman Solicitors on their fabulous terrace. Join us for an enjoyable evening of networking, drinks, and delicious food, all in the company of fellow AJBN members."

Remove the `"Open to members & guests"` highlight so no "and guests" wording remains.

## 2. Members showcase — replace curated list
`src/components/landing/MembersShowcase.tsx`: fully replace the `CURATED` array with the master list, applying:

- **Barnett Waddingham removed** (per your instruction).
- Deduplicated and sorted A–Z by company name.
- `industry` populated from your verified mapping (blank string when no mapping was supplied).
- Every entry uses `member_count: 1, has_lion: false`.

Final ordered companies (133 total):

AccountingPreneur, ActionCoach, ADBH Advisory Limited, Affinity Group Financial Services Limited, Alexander Lawson, Ali Legal, Allica Bank, Ash Verma Consulting Ltd., Atom CTO, ATZ Finance, Azure Wealth, B2Bfinance.com, BDO, Begbies Traynor, Benjamin Stevens Estate Agents, Berenblut IT Training & Consultancy, Bhardwaj Insolvency Practitioners, Bika Construction Ltd, BKL, Blake Morgan, Bridge Insurance Brokers Limited, Clear Insurance Management, Clegg Gifford, Clitheroe Shah Consultancy Services, Cooper Parry, Coots & Boots, Core Financial Paraplanning Limited, Crestcom - Greater London, Crispy Dog Productions, Crown Fire Systems Ltd, Custodia, Desaga Recruitment, Devonshires Solicitors, DKLM, DNS Accountants Ltd, DOHR, Dooa Captial, Edwin Coe, Enlight Group, Eureka Capital Allowances, Expedium, Finawis Advisors, First Financial, Five Star Estates, FRP Advisory Trading Limited, Full Power Utilities, Funnel Automation, Gardner's Trees, GB Bank, Genesis Advisory Services (UK) Ltd, Gravita, Gryphon Property Partners, Hammered, Hartsbourne Country Club, Heath Crawford, Hodge Jones & Allen, Housing Enterprise Solutions Ltd, HSBC, Inegral Advice Ltd, Inflow Finance, Inspired Lending, Investec, JLP Productions, JSL Actuarial Ltd, Jury O'Shea, Kallis, Landlord Property Exchange, Laurence Grant, LDN Finance, LETSiNVEST, London Credit, Lubbock Fine, Machins Solicitors, Make A Point, Manak Solicitors, Maris Interiors, Metrus Property Advisors, MGI Holdings, Mizrahi Tefahot Bank Ltd, Morphosis Venture Capital, Mortimer Street Capital, MT Finance, Navigate Business Recovery Ltd, Nishma Shah, Nyman Libson Paul, Omnia Housing Ltd, Oracle Solicitors, Orwins, Phillip Shaw, Pinnacle Global Group, Plumbing on Demand, Point 2 Surveyors, Prideview Group, Q Asset Management, Quastels, Red Rock Mortgages Ltd, Reim Capital, Rosenblatt Law, Roundtree Real Estate, RWK Goodman, RYSE Finance Ltd, Saul Gerrard Surveyors, SBI UK Ltd, Seddons GSC, Seduolo, Shawbrook Bank, Sherrards Solicitors, Singletree Accountants, Sirius Finance, SJC Finance, Sobell Rhodes, Spector Constant & Williams, Squire Patton Boggs, Sterling Property Assets, Sterlingworth Surveyors Ltd, Technica Solutions, The Dot HQ, The TMS Group (Taylor Mac Solutions Ltd), Together, Tradelend, Treacle Factory, Utility Warehouse, VEA, Velvet Home Inventories, Virgin Money, VS Management, VWV, Vyman Solicitors, WealthInvest Group, Wellbeing Living Ltd, Whitehall Capital, Winkworth Hendon & Kingsbury, Wow Merchandise, Xanda.

## 3. Chat / messaging — untouched
No files under messaging, chat, notifications, routing, PWA, service worker, manifest, auth, or database will be modified. After the two edits I'll run the typecheck/build to confirm nothing else broke.

## Files touched
- `src/components/landing/EventsSection.tsx`
- `src/components/landing/MembersShowcase.tsx`

Please switch to Build mode to apply.
