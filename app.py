import streamlit as st
from openai import OpenAI

# ==========================================
# OPENROUTER CONFIGURATION
# ==========================================

import os
API_KEY = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
    default_headers={
        "HTTP-Referer": "http://localhost:8501",
        "X-Title": "StoryVerse AI"
    }
)

MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"


# ==========================================
# PAGE CONFIGURATION
# ==========================================

st.set_page_config(
    page_title="StoryVerse AI",
    page_icon="📖",
    layout="wide"
)

st.title("📖 StoryVerse AI")
st.subheader("Your Imagination. Your Choices. Your Story.")

st.write(
    "An AI-powered interactive storytelling agent "
    "that creates stories based on your imagination."
)


# ==========================================
# SESSION MEMORY
# ==========================================

if "chapters" not in st.session_state:
    st.session_state.chapters = []

if "decisions" not in st.session_state:
    st.session_state.decisions = []

if "theme" not in st.session_state:
    st.session_state.theme = ""

if "genre" not in st.session_state:
    st.session_state.genre = ""

if "started" not in st.session_state:
    st.session_state.started = False


# ==========================================
# AI STORY GENERATOR
# ==========================================

def generate_story(prompt):

    response = client.chat.completions.create(
        model=MODEL,

        messages=[
            {
                "role": "system",
                "content": """
You are StoryVerse, an intelligent autonomous
interactive storytelling agent.

Your responsibilities:

1. Create imaginative and engaging stories.
2. Maintain consistent characters.
3. Remember previous events.
4. Maintain continuity across chapters.
5. Adapt the plot to user decisions.
6. Create meaningful consequences.
7. Introduce unexpected twists.
8. End each chapter with exactly THREE choices.

Always include a STORY MEMORY section
containing updated characters and important events.
"""
            },

            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.8,
        max_tokens=2500
    )

    return response.choices[0].message.content


# ==========================================
# STORY CREATION
# ==========================================

st.markdown("---")

st.header("🌍 Create Your Own Story")

theme = st.text_input(
    "Enter your story theme",

    placeholder="Example: A world controlled by artificial intelligence..."
)

genre = st.selectbox(
    "Select your story genre",

    [
        "Fantasy",
        "Horror",
        "Romance",
        "Science Fiction",
        "Adventure",
        "Mystery",
        "Thriller"
    ]
)


if st.button("🚀 Generate My Story", use_container_width=True):

    if not API_KEY.startswith("sk-or-v1-") or "PASTE_YOUR" in API_KEY:

        st.error("Please add your OpenRouter API key inside app.py.")

    elif not theme.strip():

        st.warning("Please enter a story theme.")

    else:

        st.session_state.theme = theme
        st.session_state.genre = genre

        st.session_state.chapters = []
        st.session_state.decisions = []

        st.session_state.started = True

        prompt = f"""
Create the first chapter of an interactive story.

THEME: {theme}

GENRE: {genre}

Requirements:

- Create an interesting story opening.
- Introduce 2-3 memorable characters.
- Give each character a personality.
- Establish the story setting.
- Create an interesting conflict.
- Make the chapter immersive.

At the end provide:

STORY MEMORY:
Characters and their descriptions.
Important events.

NEXT CHOICES:
1. Choice one
2. Choice two
3. Choice three
"""

        try:

            with st.spinner("✨ Creating your story..."):

                result = generate_story(prompt)

            st.session_state.chapters.append(result)

            st.rerun()

        except Exception as e:

            st.error(f"Story generation failed: {e}")


# ==========================================
# DISPLAY STORY
# ==========================================

if st.session_state.started:

    st.markdown("---")

    st.header("📚 Your Adventure")

    for index, chapter in enumerate(
        st.session_state.chapters
    ):

        st.markdown(f"## Chapter {index + 1}")

        st.markdown(chapter)

        st.markdown("---")


# ==========================================
# USER DECISION ENGINE
# ==========================================

if st.session_state.started:

    st.header("🎯 What happens next?")

    decision = st.text_input(
        "Make your decision",

        placeholder="Example: I choose option 2..."
    )

    if st.button("Continue Story ➡️", use_container_width=True):

        if not decision.strip():

            st.warning("Please enter your decision.")

        else:

            previous_story = "\n\n".join(
                st.session_state.chapters
            )

            previous_decisions = "\n".join(
                st.session_state.decisions
            )

            prompt = f"""
Continue the SAME interactive story.

ORIGINAL THEME:
{st.session_state.theme}

GENRE:
{st.session_state.genre}

PREVIOUS CHAPTERS:
{previous_story}

PREVIOUS USER DECISIONS:
{previous_decisions}

LATEST USER DECISION:
{decision}

IMPORTANT INSTRUCTIONS:

1. Continue from the exact previous events.
2. Remember every previously introduced character.
3. Remember character relationships.
4. Remember all important events.
5. Never contradict previous chapters.
6. Make the user's decision affect the storyline.
7. Show realistic consequences.
8. Introduce interesting plot twists.
9. Do not restart the story.

Generate the next chapter.

At the end include:

STORY MEMORY:
Updated character information.
Updated important events.

NEXT CHOICES:
1. Choice one
2. Choice two
3. Choice three
"""

            try:

                with st.spinner("✨ Your story is evolving..."):

                    result = generate_story(prompt)

                st.session_state.decisions.append(decision)

                st.session_state.chapters.append(result)

                st.rerun()

            except Exception as e:

                st.error(f"Story continuation failed: {e}")


# ==========================================
# MEMORY DASHBOARD
# ==========================================

with st.sidebar:

    st.title("🧠 Story Memory")

    st.metric(
        "Chapters",
        len(st.session_state.chapters)
    )

    st.metric(
        "Decisions",
        len(st.session_state.decisions)
    )

    if st.session_state.started:

        st.write("Theme:", st.session_state.theme)

        st.write("Genre:", st.session_state.genre)

        with st.expander("Previous Decisions"):

            for index, decision in enumerate(
                st.session_state.decisions
            ):

                st.write(f"{index + 1}. {decision}")

    st.markdown("---")

    if st.button("🔄 Restart Story"):

        for key in [
            "chapters",
            "decisions",
            "theme",
            "genre",
            "started"
        ]:

            del st.session_state[key]

        st.rerun()

    st.caption("Powered by NVIDIA Nemotron via OpenRouter")