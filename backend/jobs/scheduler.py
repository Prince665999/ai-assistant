"""
Step 20: Scheduler.

Runs jobs.mock_data_generator.tick() every few minutes so the mock
analytics dashboard keeps changing while you work on it - useful for
spotting stale-cache issues and rendering bugs in the frontend charts.

Wire this up once in main.py:

    from jobs.scheduler import start_scheduler, stop_scheduler

    @app.on_event("startup")
    def on_startup():
        start_scheduler()

    @app.on_event("shutdown")
    def on_shutdown():
        stop_scheduler()
"""

from apscheduler.schedulers.background import BackgroundScheduler

from jobs.mock_data_generator import tick

scheduler = BackgroundScheduler(timezone="UTC")


def start_scheduler(interval_minutes: int = 5):
    if scheduler.running:
        return
    scheduler.add_job(
        tick,
        "interval",
        minutes=interval_minutes,
        id="mock_data_tick",
        replace_existing=True,
    )
    scheduler.start()
    print(f"Mock data scheduler started - new data point every {interval_minutes} minute(s).")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
