#!/usr/bin/env python3
"""
OTP lifecycle email generator.
Single source of truth: series.json. Renders every email to out/email-NN.html
using one shared brand shell, builds an index, and emits series.tsv for the
Google Sheet. Edit series.json (or the sheet) and re-run -- no hand-maintaining
30 files.

Run: python3 generate.py
"""
import json, pathlib, html

HERE = pathlib.Path(__file__).parent
OUT = HERE / "out"
OUT.mkdir(exist_ok=True)
# Preview images resolve relative to out/ -> ../../../public/images
# (out/ -> email-series/ -> .preview/ -> otp-platform/ -> public/images)
IMG = "../../../public/images"

GREEN = "#A8E63A"; GREEN_DEEP = "#8BC42A"; INK = "#1a2e05"; BG = "#F5F7FA"; LINK = "#5a7d1f"

def header():
    return (f'<tr><td style="background:{INK};padding:18px 28px 16px 28px;">'
            f'<a href="https://orgtp.com" style="text-decoration:none;">'
            f'<img src="{IMG}/otp-lockup-white-2x.png" height="22" alt="OTP" style="height:22px;width:auto;display:block;border:0;"></a>'
            f'<div style="font-size:11px;font-weight:700;color:{GREEN};margin-top:8px;letter-spacing:0.06em;text-transform:uppercase;">The Organization Operating System</div>'
            f'</td></tr>')

def footer():
    return ('<tr><td style="padding:0 32px 28px 32px;"><div style="border-top:1px solid #ECEFF3;margin-bottom:16px;"></div>'
            '<p style="font-size:13px;color:#999;margin:0 0 6px 0;">You\'re receiving this because you signed up at '
            '<a href="https://orgtp.com" style="color:#999;font-weight:600;">orgtp.com</a>.</p>'
            '<p style="font-size:13px;color:#999;margin:0;"><a href="#" style="color:#999;">Unsubscribe</a></p></td></tr>')

def cta_button(label, url):
    return (f'<tr><td align="center" style="padding:0 32px 24px 32px;">'
            f'<a href="{url}" style="display:inline-block;padding:14px 30px;background:{GREEN};color:{INK};border-radius:10px;'
            f'font-size:16px;font-weight:800;text-decoration:none;border:1px solid {GREEN_DEEP};">{label} &rarr;</a></td></tr>')

def did_you_know(d):
    return (f'<tr><td style="padding:0 32px 20px 32px;">'
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{INK};border-radius:12px;"><tr>'
            f'<td width="56" valign="middle" style="padding:16px 0 16px 18px;"><img src="{IMG}/orgy-magnify.png" width="40" alt="" style="width:40px;height:auto;display:block;"></td>'
            f'<td valign="middle" style="padding:16px 18px 16px 12px;">'
            f'<p style="margin:0 0 2px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:{GREEN};text-transform:uppercase;">Did you know</p>'
            f'<p style="margin:0;font-size:14px;color:#eaf5d8;">{d["text"]}'
            + (f' <a href="{d["linkUrl"]}" style="color:{GREEN};font-weight:700;text-decoration:none;">{d["linkLabel"]} &rarr;</a>' if d.get("linkUrl") else '')
            + '</p></td></tr></table></td></tr>')

def cards(card_list):
    rows = ''
    for c in card_list:
        rows += (f'<tr><td style="padding:0 32px 14px 32px;">'
                 f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7FBEF;border:1px solid #E4F2C8;border-radius:12px;"><tr>'
                 f'<td width="64" valign="top" style="padding:16px 0 16px 16px;"><img src="{IMG}/{c["mascot"]}" width="48" alt="" style="width:48px;height:auto;display:block;"></td>'
                 f'<td valign="top" style="padding:16px 16px 16px 12px;">'
                 f'<p style="margin:0 0 4px 0;font-size:15px;font-weight:800;">{c["title"]}</p>'
                 f'<p style="margin:0 0 8px 0;font-size:14px;color:#444;"><strong>Why it exists:</strong> {c["why"]}</p>'
                 f'<a href="{c["linkUrl"]}" style="font-size:14px;font-weight:700;color:{LINK};text-decoration:none;">{c["linkLabel"]} &rarr;</a>'
                 f'</td></tr></table></td></tr>')
    return rows

def render(e):
    parts = ['<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">',
             '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
             f'<title>{html.escape(e["subject"])}</title></head>',
             f'<!-- {str(e["n"]).zfill(2)} | day {e["day"]} | {e["phase"]} | trigger:{e["trigger"]} | skipIf:{e.get("skipIf","-")} | routeVerified:{e.get("routeVerified",True)} -->',
             f'<body style="margin:0;padding:0;background:{BG};font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.6;">',
             f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BG};"><tr><td align="center" style="padding:32px 16px;">',
             '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ECEFF3;">',
             header(),
             f'<tr><td align="center" style="padding:28px 28px 4px 28px;"><img src="{IMG}/{e["mascot"]}" width="120" alt="Orgy" style="width:120px;height:auto;display:block;"></td></tr>',
             '<tr><td style="padding:8px 32px 0 32px;">']
    if e.get("eyebrow"):
        parts.append(f'<p style="margin:0 0 6px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:{GREEN_DEEP};text-transform:uppercase;">{e["eyebrow"]}</p>')
    parts.append(f'<h1 style="font-size:24px;font-weight:800;letter-spacing:-0.02em;margin:0 0 16px 0;line-height:1.25;">{e["headline"]}</h1>')
    parts.append('<p style="margin:0 0 16px 0;font-size:16px;">Hi {{firstName}},</p>')
    for p in e["body"]:
        parts.append(f'<p style="margin:0 0 16px 0;font-size:16px;">{p}</p>')
    parts.append('</td></tr>')
    parts.append(cta_button(e["cta"]["label"], e["cta"]["url"]))
    if e.get("cards"):
        parts.append('<tr><td style="padding:8px 32px 4px 32px;"><p style="margin:0 0 14px 0;font-size:12px;font-weight:800;letter-spacing:0.08em;color:'+GREEN_DEEP+';text-transform:uppercase;">While you wait, here\'s what\'s inside</p></td></tr>')
        parts.append(cards(e["cards"]))
    if e.get("didYouKnow"):
        parts.append(did_you_know(e["didYouKnow"]))
    if e.get("secondary"):
        parts.append(f'<tr><td style="padding:0 32px 8px 32px;"><p style="margin:0 0 16px 0;font-size:15px;color:#555;">{e["secondary"]}</p></td></tr>')
    parts.append('<tr><td style="padding:0 32px 8px 32px;"><p style="margin:0 0 28px 0;font-size:16px;font-weight:600;">David</p></td></tr>')
    parts.append(footer())
    parts.append('</table></td></tr></table></body></html>')
    return '\n'.join(parts)

def main():
    data = json.loads((HERE / "series.json").read_text())
    emails = data["emails"]
    # render each
    for e in emails:
        (OUT / f'email-{e["n"]:02d}.html').write_text(render(e))
    # inactivity re-engagement (separate behavioral trigger)
    if data.get("reengage"):
        (OUT / 'reengage-inactive.html').write_text(render(data["reengage"]))
    # index
    idx = ['<!DOCTYPE html><html><head><meta charset="UTF-8"><title>OTP 90-Day Email Series</title>',
           '<style>body{font-family:-apple-system,sans-serif;background:#F5F7FA;color:#1a2e05;max-width:900px;margin:0 auto;padding:32px}',
           'h1{font-size:26px}h2{margin-top:28px;border-bottom:2px solid #A8E63A;padding-bottom:6px}',
           'table{border-collapse:collapse;width:100%;font-size:14px;background:#fff;border-radius:10px;overflow:hidden}',
           'td,th{padding:8px 10px;border-bottom:1px solid #eee;text-align:left}th{background:#1a2e05;color:#A8E63A}',
           'a{color:#5a7d1f;font-weight:600}.day{color:#888;font-weight:700;white-space:nowrap}</style></head><body>',
           '<h1>OTP 90-Day Lifecycle Email Series</h1>',
           f'<p>{len(emails)} time-based emails + 1 behavioral re-engagement. M-F only, no weekends. Click any row to preview.</p>']
    phase = None
    idx.append('<table><tr><th>#</th><th>Day</th><th>Subject</th><th>CTA</th><th>Trigger / Skip</th></tr>')
    for e in emails:
        if e["phase"] != phase:
            phase = e["phase"]
            idx.append(f'<tr><td colspan="5" style="background:#D6F59C;font-weight:800;text-transform:uppercase;font-size:12px;letter-spacing:.06em;">{phase}</td></tr>')
        skip = e.get("skipIf","")
        idx.append(f'<tr><td class="day">{e["n"]:02d}</td><td class="day">D{e["day"]}</td>'
                   f'<td><a href="email-{e["n"]:02d}.html">{html.escape(e["subject"])}</a></td>'
                   f'<td>{html.escape(e["cta"]["label"])}</td>'
                   f'<td style="color:#888">{e["trigger"]}{(" · skip if "+skip) if skip else ""}</td></tr>')
    if data.get("reengage"):
        r = data["reengage"]
        idx.append('<tr><td colspan="5" style="background:#1a2e05;color:#A8E63A;font-weight:800;text-transform:uppercase;font-size:12px;">Behavioral</td></tr>')
        idx.append(f'<tr><td class="day">RE</td><td class="day">-</td><td><a href="reengage-inactive.html">{html.escape(r["subject"])}</a></td>'
                   f'<td>{html.escape(r["cta"]["label"])}</td><td style="color:#888">{r["trigger"]}</td></tr>')
    idx.append('</table></body></html>')
    (OUT / 'index.html').write_text('\n'.join(idx))
    # TSV for Google Sheet
    tsv = ['#\tDay\tPhase\tTrigger\tSkip If\tSubject\tHeadline\tMascot\tCTA Label\tCTA URL\tRoute Verified\tPreview File']
    for e in emails:
        tsv.append('\t'.join(str(x) for x in [
            f'{e["n"]:02d}', e["day"], e["phase"], e["trigger"], e.get("skipIf",""),
            e["subject"], e["headline"], e["mascot"], e["cta"]["label"], e["cta"]["url"],
            e.get("routeVerified", True), f'email-{e["n"]:02d}.html']))
    if data.get("reengage"):
        r = data["reengage"]
        tsv.append('\t'.join(str(x) for x in ['RE','-','Behavioral', r["trigger"], r.get("skipIf",""),
            r["subject"], r["headline"], r["mascot"], r["cta"]["label"], r["cta"]["url"], r.get("routeVerified",True),'reengage-inactive.html']))
    (HERE / 'series.tsv').write_text('\n'.join(tsv))
    print(f"Rendered {len(emails)} emails + reengage. Index: out/index.html  TSV: series.tsv")

if __name__ == "__main__":
    main()
