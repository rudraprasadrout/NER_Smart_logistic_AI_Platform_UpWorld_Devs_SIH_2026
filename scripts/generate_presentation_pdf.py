import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas that adds clean running headers and page numbers on every page."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress headers/footers on title cover page
        
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, 750, "PathNER AI — Smart Logistics & Disaster Accessibility Platform")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, 742, letter[0] - 54, 742)
        
        # Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 36, "Smart India Hackathon 2026 · Confidential Team Guide & Presentation Reference")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.line(54, 48, letter[0] - 54, 48)
        
        self.restoreState()

def build_pdf(filename="PathNER_Complete_Platform_Guide.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Typography Styles
    c_primary = colors.HexColor("#0f172a")     # Deep Slate
    c_accent = colors.HexColor("#4f46e5")      # Electric Indigo
    c_gold = colors.HexColor("#d97706")        # Saffron Gold
    c_green = colors.HexColor("#059669")       # Rainforest Emerald
    c_danger = colors.HexColor("#dc2626")      # Critical Red
    c_card_bg = colors.HexColor("#f8fafc")     # Light Card Tint
    c_border = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=c_primary,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=18,
        textColor=c_accent,
        spaceAfter=14
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#64748b")
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_accent,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        leftIndent=12,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0f172a")
    )

    story = []

    # ==========================================
    # COVER PAGE
    # ==========================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("PathNER AI 2.0", title_style))
    story.append(Paragraph("Smart Logistics & Dynamic Accessibility Platform for Northeast India", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=3, color=c_accent, spaceBefore=4, spaceAfter=20))
    
    summary_html = (
        "<b>Comprehensive System Architecture, Operational Workflow, and Presentation Reference Manual</b><br/><br/>"
        "PathNER is an end-to-end AI-powered geospatial intelligence and supply-chain resilience platform engineered "
        "specifically for the fragile mountain topography of Northeast India (Assam, Meghalaya, Dima Hasao, Barak Valley). "
        "It safeguards critical lifeline arteries by combining Machine Learning hazard forecasting, real-time graph reachability, "
        "multi-criteria safe routing, generative multilingual advisories, and offline PWA field reporting."
    )
    
    cover_box_table = Table(
        [[Paragraph(summary_html, body_style)]],
        colWidths=[letter[0] - 108]
    )
    cover_box_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_card_bg),
        ('BOX', (0, 0), (-1, -1), 1.5, c_accent),
        ('PADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(cover_box_table)
    story.append(Spacer(1, 40))

    meta_content = (
        "<b>Event / Project:</b> Smart India Hackathon (SIH 2026)<br/>"
        "<b>Team:</b> UpWorld Devs<br/>"
        "<b>Target Geography:</b> Northeast Region (Guwahati, Shillong, Haflong, Silchar, East Jaintia Hills)<br/>"
        "<b>Datasets Processed:</b> 968 Settlement Nodes & 824 Authentic Road Segments (OpenStreetMap + Topographic Elevation)<br/>"
        "<b>Core AI Engine:</b> Pre-Trained Risk Model (Gradient Boosting / Random Forest) + Mistral AI Tactical LLM<br/>"
        "<b>Offline Engine:</b> ServiceWorker + LocalStorage Queue (PWA)"
    )
    story.append(Paragraph(meta_content, meta_style))
    story.append(PageBreak())

    # ==========================================
    # SECTION 1: THE CORE PROBLEM & THE SOLUTION
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Problem Context", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "<b>The Challenge in Northeast India:</b><br/>"
        "The Northeast Region (NER) of India is geologically active and experiences some of the highest precipitation in the world "
        "(e.g., Cherrapunjee and Mawsynram). During monsoons, strategic national highways—especially <b>NH-6 (connecting Assam, Meghalaya, and Barak Valley)</b> "
        "and <b>NH-27 / NH-627 (through Dima Hasao)</b>—suffer frequent, catastrophic disruptions from mudslides, boulder falls, "
        "and flash floods. When an arterial road collapses:",
        body_style
    ))
    story.append(Paragraph("• <b>Severed Supply Chains:</b> Remote communities run out of food, medicine, and fuel within 3 to 5 days.", bullet_style))
    story.append(Paragraph("• <b>Blind Dispatch Routing:</b> Standard GPS navigation apps (like Google Maps) blindly route heavy relief trucks into impassable active landslide zones.", bullet_style))
    story.append(Paragraph("• <b>Zero-Signal Field Blindspots:</b> Ground engineers from BRO and PWD lack cellular connectivity in steep hill valleys to transmit incident reports.", bullet_style))

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>The PathNER Solution:</b>", h2_style))
    story.append(Paragraph(
        "PathNER solves these three vulnerabilities through a unified, 4-pillar digital platform:<br/>"
        "1. <b>ML Multi-Variable Hazard Prediction:</b> Pre-trained Gradient Boosting models compute real-time risk scores (0–100%) for every road corridor using terrain slope gradient, soil saturation, and precipitation forecasts.<br/>"
        "2. <b>Dynamic Graph Reachability (Isolation Index):</b> The platform runs continuous Breadth-First-Search (BFS) reachability scans across all 968 nodes to identify communities cut off from supply hubs before emergency supplies deplete.<br/>"
        "3. <b>Multi-Criteria AI Route Dispatcher:</b> Computes dual route options: the dangerous standard path vs. the AI-Recommended Safe Bypass path that avoids high-risk bottlenecks.<br/>"
        "4. <b>Offline-First Field Reporter (PWA):</b> Enables ground patrols to submit geo-tagged incident reports without cellular network, queueing them in local storage and auto-syncing upon reconnection.",
        body_style
    ))

    story.append(Spacer(1, 10))

    # ==========================================
    # SECTION 2: PLATFORM ARCHITECTURE & TECH STACK
    # ==========================================
    story.append(Paragraph("2. Technical Architecture & Data Pipeline", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=10))

    tech_data = [
        [Paragraph("<b>Component Layer</b>", h2_style), Paragraph("<b>Technology Used</b>", h2_style), Paragraph("<b>Core Responsibility</b>", h2_style)],
        [Paragraph("<b>Backend Server</b>", body_style), Paragraph("Python 3.12, Flask 3.0", body_style), Paragraph("REST API endpoints, routing calculations, session cache, sub-millisecond graph evaluations.", body_style)],
        [Paragraph("<b>ML Risk Engine</b>", body_style), Paragraph("scikit-learn (pkl model)", body_style), Paragraph("Pre-trained multi-factor hazard estimation combining slope (deg), rainfall (mm), soil saturation, and active field reports.", body_style)],
        [Paragraph("<b>Graph Engine</b>", body_style), Paragraph("Custom GraphEngine (BFS / Dijkstra / A*)", body_style), Paragraph("968-node & 842-edge road network, dynamic impedance weighting, reachability graph evaluation.", body_style)],
        [Paragraph("<b>Tactical LLM</b>", body_style), Paragraph("Mistral AI API (with 10m TTL cache)", body_style), Paragraph("Generates military-grade disaster advisories in English, Assamese, Bengali, and Hindi with zero credit waste.", body_style)],
        [Paragraph("<b>Database</b>", body_style), Paragraph("SQLite 3 (WAL mode)", body_style), Paragraph("Field reports, multilingual emergency alerts, user notification subscriptions with idempotent UUIDs.", body_style)],
        [Paragraph("<b>Frontend & GIS</b>", body_style), Paragraph("Leaflet.js, Vanilla CSS / JS (Dual-Theme)", body_style), Paragraph("High-contrast dual-stroke road rendering, 4 basemaps, interactive layer filter HUD, 100% mobile responsive.", body_style)],
        [Paragraph("<b>Offline Edge</b>", body_style), Paragraph("PWA / LocalStorage / ServiceWorker", body_style), Paragraph("Stores field reports locally in zero-signal mountain zones and auto-syncs when online.", body_style)]
    ]

    tech_table = Table(tech_data, colWidths=[110, 140, 254])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_card_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(tech_table)

    story.append(PageBreak())

    # ==========================================
    # SECTION 3: DETAILED MODULE-BY-MODULE WALKTHROUGH
    # ==========================================
    story.append(Paragraph("3. End-to-End Module & Workflow Walkthrough", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=10))

    # Module 1
    story.append(Paragraph("Module 1: Control Room Command Center (/)", h2_style))
    story.append(Paragraph(
        "<b>What it does:</b> The central executive operations dashboard giving commanders an instant bird's-eye view of regional logistics health.<br/>"
        "• <b>Live Top KPI Cards:</b> Real-time counters showing <i>Stranded Population</i> (fully cut off), <i>Severed Hamlets</i> (0% reachability), "
        "<i>At-Risk Population</i> (impending isolation), and <i>Blocked Corridors</i> (&ge;70% risk).<br/>"
        "• <b>72-Hour Timelapse Simulation Player (▶):</b> Click the Play button to watch an animated 4-step forecast progression (Now &rarr; +24h &rarr; +48h &rarr; +72h) "
        "showing how corridors degrade as monsoon rains accumulate.<br/>"
        "• <b>Interactive Layer Filter HUD:</b> Toggle buttons (Roads, Hubs, Chokepoints, Fleet) allowing dispatchers to declutter map information.<br/>"
        "• <b>Live Fleet Simulator:</b> Tracks 4 autonomous relief convoys navigating live delivery routes.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Module 2
    story.append(Paragraph("Module 2: AI Multi-Criteria Route Dispatcher (/routes)", h2_style))
    story.append(Paragraph(
        "<b>What it does:</b> Calculates the optimal delivery path between central supply depots and remote delivery points.<br/>"
        "• <b>Side-by-Side Path Comparison:</b> Simultaneously evaluates the <i>Standard Shortest Path</i> (fastest under normal conditions, but traverses active landslides) "
        "versus the <i>AI-Recommended Safe Bypass</i> (minimizes slope hazard and bypasses breaches).<br/>"
        "• <b>AI Decision Verdict Banner:</b> Plain-language summary explaining exact trade-offs (e.g., <i>\"AI Reroute Recommended: Safe bypass adds 42km (+0.9h) but avoids 1 active landslide bottleneck, reducing mission risk from 74% to 18%.\"</i>)<br/>"
        "• <b>Turn-by-Turn Waypoint Stepper:</b> Displays intermediate waypoints, elevation gradient, and clearance alerts for convoy drivers.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Module 3
    story.append(Paragraph("Module 3: Field Incident Reporter & Offline PWA (/field-reporter)", h2_style))
    story.append(Paragraph(
        "<b>What it does:</b> Mobile-first digital reporting interface for BRO patrol officers and PWD engineers on the ground.<br/>"
        "• <b>Offline Queue Architecture:</b> In zero-connectivity valleys, clicking 'Transmit Report' saves the incident into browser LocalStorage. "
        "As soon as the patrol vehicle enters 2G/4G coverage, the PWA auto-syncs the queue to Central Command.<br/>"
        "• <b>Live Judge Simulation Bar:</b> Built specifically for hackathon evaluators:<br/>"
        "&nbsp;&nbsp;1. Click <i>'Load Demo Incident'</i> &rarr; auto-fills a realistic BRO rockfall report with exact GPS coordinates.<br/>"
        "&nbsp;&nbsp;2. Click <i>'Simulate Offline Mode'</i> &rarr; toggles zero-signal state; submit report to queue locally.<br/>"
        "&nbsp;&nbsp;3. Click <i>'Restore Online & Sync'</i> &rarr; triggers background sync, updating the central map in real-time.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Module 4
    story.append(Paragraph("Module 4: Tactical Emergency Response Mode (/disaster-mode)", h2_style))
    story.append(Paragraph(
        "<b>What it does:</b> High-urgency command mode activated during active flood/landslide disasters.<br/>"
        "• <b>AI Tactical Directive Console:</b> Generates real-time logistical directives using Mistral AI, translated on-the-fly into 4 languages (English, Assamese, Bengali, Hindi). "
        "Responses are cached both on backend (10min) and frontend to save 100% of repeated API credits.<br/>"
        "• <b>Severed Settlements Priority Queue:</b> Lists cut-off hamlets ranked by urgency, showing remaining food/medicine buffer days (countdown bar) and population.<br/>"
        "• <b>1-Click Relief Pre-fill:</b> Click 'Dispatch Relief &rarr;' on any severed settlement to instantly open the Route Dispatcher with that destination pre-selected.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Module 5: Conversational AI Copilot & Chatbot
    story.append(Paragraph("Module 5: Drishti AI — Conversational Logistics Copilot (Floating Drawer)", h2_style))
    story.append(Paragraph(
        "<b>What it does:</b> An interactive floating AI assistant (named <b>Drishti AI</b> — <i>Predictive Vision & Foresight</i>) accessible across every page.<br/>"
        "• <b>Live Platform Awareness:</b> Automatically injects current real-time telemetry into every conversation (active road blocks, landslide hazards on NH-6, severed settlements count, and convoy status).<br/>"
        "• <b>Dual-Engine Architecture:</b> Powered by Mistral AI LLM with an intelligent local domain NLP fallback engine, delivering sub-second replies with zero API credit waste.<br/>"
        "• <b>Multilingual Natural Language:</b> Understands and answers disaster inquiries in English, Hindi, Assamese, and Bengali.<br/>"
        "• <b>1-Click Quick Chips:</b> Allows emergency commanders to instantly query corridor status (<i>'⚠️ NH-6 Status'</i>, <i>'🛡️ Route to Silchar'</i>, <i>'📦 Isolated Hamlets'</i>, <i>'📡 Offline Reporting'</i>).",
        body_style
    ))

    story.append(PageBreak())

    # ==========================================
    # SECTION 4: PRESENTATION PITCH GUIDE & TALKING POINTS
    # ==========================================
    story.append(Paragraph("4. Presentation Pitch & Judge Demonstration Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Use this structured 3-minute pitch flow when presenting PathNER to judges or team members:",
        body_style
    ))

    pitch_data = [
        [Paragraph("<b>Step & Time</b>", h2_style), Paragraph("<b>What to Say (Script in Simple Words)</b>", h2_style), Paragraph("<b>What to Show on Screen</b>", h2_style)],
        [
            Paragraph("<b>1. The Hook<br/>(0:00 - 0:40)</b>", body_style),
            Paragraph("\"Every monsoon in Northeast India, landslides on NH-6 cut off the entire Barak Valley and Meghalaya hills. When roads collapse, thousands of people run out of food and medicine in 3 days. Google Maps cannot tell you if a mountain road is collapsing. That's why we built PathNER AI.\"", body_style),
            Paragraph("Open <b>Control Room (/)</b>. Point out the Live KPI cards: 4 Severed Hamlets, 13,453 Stranded Population, and the clean map with high-contrast road corridors.", body_style)
        ],
        [
            Paragraph("<b>2. AI Routing<br/>(0:40 - 1:20)</b>", body_style),
            Paragraph("\"Watch what happens when a dispatcher routes supplies from Guwahati to Silchar. Standard apps suggest the shortest path through Jaintia Hills, which is currently blocked by a 74% risk landslide. PathNER's AI algorithm automatically calculates a safe bypass via Haflong, adding a few kilometers but ensuring 100% mission safety.\"", body_style),
            Paragraph("Navigate to <b>Route Dispatch (/routes)</b>. Click the preset <i>'Guwahati &rarr; Silchar'</i>. Show the orange dashed blocked route vs. the solid emerald safe route and the Decision Banner.", body_style)
        ],
        [
            Paragraph("<b>3. Offline PWA<br/>(1:20 - 2:00)</b>", body_style),
            Paragraph("\"In the steep hills, road engineers have zero cell signal. Our Field Reporter works 100% offline. An officer submits a report in a dead zone, it queues in the browser, and as soon as signal returns, it automatically syncs with the Control Room, updating the entire AI reachability model.\"", body_style),
            Paragraph("Open <b>Field Report (/field-reporter)</b>. Click <i>'Load Demo Incident'</i> &rarr; click <i>'Simulate Offline Mode'</i> &rarr; submit &rarr; show offline queue card &rarr; click <i>'Restore Online & Sync'</i>.", body_style)
        ],
        [
            Paragraph("<b>4. Emergency Mode<br/>(2:00 - 2:30)</b>", body_style),
            Paragraph("\"In Emergency Mode, our Mistral AI tactical engine delivers multilingual briefings in Assamese, Bengali, Hindi, and English, prioritizing communities whose supply buffer is about to hit zero.\"", body_style),
            Paragraph("Open <b>Emergency (/disaster-mode)</b>. Toggle the language buttons (EN / Assamese / Bengali / Hindi) to show instantaneous translated directives.", body_style)
        ],
        [
            Paragraph("<b>5. Drishti AI Demo<br/>(2:30 - 3:00)</b>", body_style),
            Paragraph("\"Lastly, commanders can chat directly with our Drishti AI Copilot in natural language. Click a quick prompt chip or ask 'Is NH-6 open?', and it immediately gives live, contextual answers.\"", body_style),
            Paragraph("Click the <b>Drishti AI</b> button in the bottom right corner &rarr; click <i>'⚠️ NH-6 Status'</i> chip &rarr; show instant tactical intelligence reply.", body_style)
        ]
    ]

    pitch_table = Table(pitch_data, colWidths=[90, 230, 184])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_card_bg),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(pitch_table)

    story.append(Spacer(1, 14))

    story.append(Paragraph("Key Differentiators & Competitive Advantage:", h2_style))
    story.append(Paragraph("1. <b>Real Localized Data:</b> Uses 968 real GPS nodes & 824 authentic OpenStreetMap corridors from Northeast India.", bullet_style))
    story.append(Paragraph("2. <b>Sub-Millisecond Speed:</b> In-memory graph caching evaluates entire regional networks in under 1ms.", bullet_style))
    story.append(Paragraph("3. <b>Dual-Theme High Contrast:</b> Perfectly readable in both sunlight/light mode and night tactical dark mode.", bullet_style))
    story.append(Paragraph("4. <b>Offline-First Resilience:</b> Zero cell signal requirement for field responders.", bullet_style))
    story.append(Paragraph("5. <b>Drishti AI Copilot:</b> Real-time conversational AI copilot for emergency commanders.", bullet_style))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf()

