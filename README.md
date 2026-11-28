THE STARTFORGEAI:
This contains frontend and backend.
Added gemini intigration to the application.
use api key in a .env file so it could use the api.
file should only contain the key nothing else.
Eg: GEMINI_API="YOUR API KEY"(remove the quotes and enter your key).
gemini analysis is working.
and also added the option to download pdf report of the data.
it will analyse the weakness andvantage of your startup idea.
we added mongo db connection to the application so we can save our login info.
and also it contains login athentcation system.
also improved the navebar.
Currently its in development phase.
Thank you .

## Technology founder guide upgrade

New startup assessments save a structured `founder_guide` JSONB payload in the existing `startup_analyses` table. Apply `backend/migrations/005_add_founder_guide.sql` to the same PostgreSQL database before starting the updated backend. The migration is additive and leaves existing report rows available; older rows continue to use the legacy report view.

The backend defaults to the current `gemini-3.8-flash` model. `GEMINI_MODEL` can override the model and `GEMINI_API_KEY` remains required. Token access and quotas depend on the Gemini API project's tier. Google Search grounding used by the separate industry competitor research action is not available on the Gemini 3 free API tier; this assessment does not enable grounding or trigger search calls.
