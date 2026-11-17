# Submersion & Refloat Planner

A decision-support tool for search and rescue teams, recovery teams and first responders working a missing-person case where the person may be in still water: a lake, pond, reservoir or flooded quarry.

It answers two field questions:

1. **How long until the person was on the bottom, and where?**
2. **Will the body resurface, and if so, when?**

The planner is a single HTML file. It runs in any modern browser, works fully offline, and sends no data anywhere.

**[Open the planner](https://delucaenterprises.github.io/Submersion-Refloat-Planner/)** · [Download `index.html`](https://github.com/DeLucaEnterprises/Submersion-Refloat-Planner/raw/main/index.html)

Built by [The Find Me Project](https://thefindmeproject.org), a veteran-run missing persons search, intelligence and media organization in North Carolina.

> **Decision support, not a prediction.** Outputs are percentages of simulated bodies. They help plan where to spend search hours. They do not say where any individual is.

---

## Quick start

- **Use it now:** download `index.html` and open it in Chrome, Edge, Firefox or Safari. No install, no account, no internet needed. Only the web font loads online; without a connection the page uses a system font and runs the same.
- **Use it online:** https://delucaenterprises.github.io/Submersion-Refloat-Planner/
- **Host your own copy:** fork this repository and enable GitHub Pages (Settings → Pages → deploy from the `main` branch, root folder).
- **Try an example:** open the **Example cases** menu: deep quarry, warm lake, cold reservoir, saltwater harbor.

## What a team enters

| Input | Notes |
| --- | --- |
| Last seen / water entry time | Used to turn day counts into calendar dates |
| Date through which no body has been seen on the surface | Used to update the odds over time |
| Weight, height, build or body fat % | Body fat is the strongest single driver of refloat |
| Clothing | Swimwear, street clothes, or heavy/winter |
| How it happened | Unconscious on entry, conscious but cannot swim, or swam until exhausted (with swimming ability) |
| Water | Fresh or salt; resting depth; max depth; surface temperature; **temperature at the resting depth**; area |
| Depth zones | The zones a body could have reached, with starting weights |

## What it returns

- A verdict: likely, uncertain or unlikely to resurface.
- Time from entry to the bottom (median and 90% range) and sink speed.
- Bottom search radius around the entry point (or distance along the shore for a swimmer).
- Chance of refloat within 7 days, 30 days and 1 year, and a surface-watch window as calendar dates.
- Given no body seen so far, the chance it still surfaces.
- For each depth zone, how likely it is that the body is there now.
- Charts: descent profile, cumulative refloat probability, gas build-up vs. lift needed, and a refloat grid by depth and temperature.

## Saving and sharing cases

- **Case file (.json):** all inputs, zones, seed, model version and results.
- **Field report (.html):** a standalone report with the verdict, charts, zone table and inputs. It opens in any browser, prints, and also opens back in the planner.
- **Verification:** opening a case file reruns the model and compares the results to the saved ones. Results that match are marked verified. A different model version is flagged. Figures that were edited by hand are flagged as a mismatch.
- **Reproducibility:** every run uses a random seed. The same inputs and seed always give identical results.
- **Audit:** each build has an engine fingerprint (a hash of the model code). Settings holds the version history and a local audit log of runs, imports and exports.

Case data, settings and the audit log are stored only in the browser that uses them.

## How the model works

Each run simulates thousands of bodies, sampling every uncertain quantity from the ranges supported by published data.

- **Body:** net weight in water is calibrated so 7% of average men float at post-mortem lung volume in fresh water (Donoghue & Minnigerode 1977). It is then adjusted for body weight, body fat (fat 0.90 kg/L, lean tissue 1.10 kg/L, 20% baseline), salt water, water replacing lung air on drowning, and wet clothing.
- **Descent:** the body sinks at terminal velocity, recalculated every 0.5 ft as air trapped in clothing compresses with depth (Boyle's law).
- **Surface phase:** about 45 s to aspirate when unconscious. Distress plus the 20–60 s instinctive drowning response (Pia 1974) when the person cannot swim. Time to swim failure, then that response, for an exhausted swimmer.
- **Resting position:** surface drift plus a 3–20° glide cone. A swimmer moves along the shore with frequent reversals.
- **Refloat:** putrefactive gas is produced in a pulse whose rate scales with temperature (Q10 2.5–4, tapering to zero between 46 °F and 39 °F) and leaks away over time, faster under pressure. The body rises when retained gas exceeds its negative buoyancy multiplied by the absolute pressure at depth.
- **Zone update:** each zone's weight is multiplied by the chance a body there would still be down after the observed days, then normalized (Bayesian search update).

## Validation

Run `node tests/engine.test.mjs` (Node 18+). The tests load the engine directly from `index.html` and check it against these benchmarks:

| Benchmark | Source | Model |
| --- | --- | --- |
| 7% of men float at post-mortem lung volume | Donoghue & Minnigerode 1977 | Calibration input |
| Final struggle lasts 20–60 s | Pia 1974 | Calibration input |
| Warm, shallow water: refloat in about 2–3 days | Calibration target | 2.4–2.6 days median at 75 °F |
| Bodies below about 200 ft generally do not bloat | Reijnen et al. 2018 | About 1 in 3 rise at 200 ft even at 75 °F; fewer in colder water |
| Very cold lakes tend to keep their dead | Lake Superior | No refloat at 39 °F or colder |

## Limits

- **Still water only.** Currents, river flow, tides, waves and wind drift are not modeled.
- **Temperature is held constant** at the resting depth. Measure it on site where possible.
- **Not modeled:** entanglement on debris, injuries that vent gas, scavenging, intoxication, medications and life jackets.
- **Assumptions:** the swim-failure time for a clothed person at night, and a body's gas capacity, are calibrated to published benchmarks, not measured directly.

## Sources

- Donoghue, E. R. & Minnigerode, S. C. (1977). Human body buoyancy: a study of 98 men. *Journal of Forensic Sciences*.
- Pia, F. (1974). Observations on the drowning of nonswimmers. *Journal of Physical Education*.
- Szpilman, D. et al. Drowning. *BMJ Best Practice*.
- Tipton, M. et al. (1999). Immersion deaths and deterioration in swimming performance in cold water. *The Lancet*.
- Reijnen, G. et al. (2018). The correlation between the Aquatic Decomposition Score and the post-mortem submersion interval measured in Accumulated Degree Days in bodies recovered from fresh water. *Forensic Science, Medicine and Pathology*.
- O'Brien, T. G. & Kuehner, A. C. (2007). Waxing grave about adipocere. *Journal of Forensic Sciences*.
- Healy, C. A. et al. (2015). Detecting submerged bodies: controlled research using side-scan sonar. *Journal of Forensic Sciences*.

## Contributing

Issues and pull requests are welcome, especially field data that can sharpen the model: measured water-temperature profiles, recovery depths and times, and refloat observations. Please remove anything that identifies a person before sharing.

## License

[MIT](LICENSE) © 2026 The Find Me Project. Provided without warranty. See the license for details.
