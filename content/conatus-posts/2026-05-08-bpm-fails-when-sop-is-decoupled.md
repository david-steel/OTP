---
title: Most BPM efforts fail for one reason that gets misnamed five different ways
date: 2026-05-08
author: David Steel
slug: bpm-fails-when-sop-is-decoupled
type: founder_essay
status: published
distribution_status: queued
---

# Most BPM efforts fail for one reason that gets misnamed five different ways

Read the consulting literature on why business process management fails and you get a familiar list. Lack of executive sponsorship. Poor change management. Insufficient training. Technology gaps. Employee resistance. Process complexity that exceeds what the team can absorb.

Each item is plausible. Each one can be cited in a real failure. The problem is that all five share a common substrate, and the substrate is what the diagnoses miss. The list is not five causes. It is one cause described from five angles by people who do not know they are looking at the same thing.

The shared substrate is this. In every BPM rollout the consulting literature describes, the SOP and the work execute in separate runtimes. The SOP runs in the document. The work runs in the human. They are connected by training, memory, and discipline, three components that decay on different timescales. When the connection breaks, the rollout fails. The list of "reasons" is just a catalog of which connection failed first.

Lack of executive sponsorship? The exec did not enforce the loop between the SOP and the work, so the loop broke first at the top. Change management? The exec who would have enforced was replaced or distracted, and the loop broke at the org level. Training? The connection never closed in the first place, because the loop required reading and most humans skim. Tech gap? The SOP lived in a system the team did not open during the work. Resistance? The team was being asked to maintain a connection between document and work that nobody had the time to maintain.

All five failures look different from inside the consulting engagement. From the outside, they are the same shape. The architecture treats the SOP as a thing humans should remember. Humans do not remember well. The architecture is asking the wrong substrate to do the load-bearing work.

The reason this has not been fixed in fifty years of BPM literature is that there was no other substrate to hand it to. Humans were the only thing that could execute the SOP. So the entire industry built tools to make humans more likely to read, more likely to remember, more likely to comply. Better fonts. Better workflows. Better dashboards. Process mining. RPA. None of it solved the underlying decoupling, because the decoupling is structural to the substrate. A document a human has to remember to read is decoupled by definition. Better tooling around the document does not change that the document is still being read by the wrong thing.

The reason this is solvable now is that there is finally another substrate. An agent. An agent is a thing that can be handed the SOP at the moment of execution and read it every single time. The agent does not need to be retrained. It does not need to be reminded. It does not need executive enforcement. It reads its system prompt because that is the only thing it can do. The SOP and the work are running in the same runtime, because the SOP is the runtime.

This changes the failure mode. A BPM rollout that targets agents does not fail because executive sponsorship lapses. It does not fail because the team forgot the doc. It fails when the SOP itself is wrong, which is a fundamentally better failure mode. A wrong SOP is debuggable. You correct it once. The next agent session reads the corrected version. A right SOP that nobody reads is not debuggable. You can fix it forever and adoption will still slip. One failure mode you can engineer your way out of. The other you cannot.

The implication for any business sitting on an SOP library that does not stick is uncomfortable. You are not going to fix the stickiness by hiring another consultant to drive adoption. You are not going to fix it with another all-hands. You are not going to fix it by switching from Notion to Process Street to a proprietary BPM vendor. The substrate is wrong for what you are asking it to do. You can hire ten consultants in series and the half-life will not change, because every one of them is solving the same wrong layer of the problem.

The fix is to move the SOP to a substrate that does not have an adoption problem because it cannot have one. That substrate is the agent under the seat. The agent reads the SOP every session because that is its mechanics. There is no compliance to drive. There is no enforcement layer to maintain. The execution and the doc are the same artifact.

This is also the answer to the question of which BPM frameworks survive into the next decade. The ones that remain documents will continue to fail in the five familiar ways. The ones that compile into agent runtime context will not, because the substrate cannot generate those failure modes. There is no consulting framework that can keep an SOP living in the work when humans are the substrate. There is no consulting framework needed to keep an SOP living in the work when agents are the substrate. The job that BPM consultants do today, in five or ten years, is going to look like the job that mainframe operators did after spreadsheets shipped. Real work that solved a real problem at a moment in time, made obsolete by a substrate change.

We built OTP for this case. SOPs sit on tiles on a team chart. Agents inherit the SOPs of the human they report to. When the SOP changes, the agent that boots next reads the change. The stickiness problem is not solved. It is dissolved. The doc and the work converge into one runtime, and the loop that used to break in five different places does not have a place to break anymore.

If your BPM effort failed, the most likely explanation is not that your team was unprepared, your sponsor was weak, your change management was thin, your tech was wrong, or your culture was resistant. The most likely explanation is that the architecture was asking humans to do the load-bearing memory work. Humans were the only substrate available when those frameworks were written. They are not anymore.
