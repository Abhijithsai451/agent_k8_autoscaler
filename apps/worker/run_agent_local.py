"""Run the agent locally without Temporal or the gateway.

    python run_agent_local.py --user alice "fetch my last 5 github notifications and summarize them"
    python run_agent_local.py --user alice --toolkit github --goal "list my open PRs"

The user must have connected the relevant app first (Composio dashboard or a ConnectLink).
Otherwise, the result comes back with a needs_auth entry instead of completing.


"""

import argparse
import asyncio
import json

from apps.worker.agent import run_agent


def main():
    parser = argparse.ArgumentParser(description="Run the agent Locally")
    parser.add_argument("--user", default = "local-test", help="Composio user_id")
    parser.add_argument("--toolkit", default = None, help="Optional Toolkit hint")
    parser.add_argument("--goal", default = None, help="Goal for the agent")
    parser.add_argument("goal_pos", nargs="?", default=None, metavar= "GOAL")
    args = parser.parse_args()

    goal = args.goal or args.goal_pos
    if not goal:
        parser.error("a goal is required (Positional Goal or --goal)")
    result = asyncio.run(
        run_agent(args.user, goal=goal, toolkit_hint=args.toolkit)
    )
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()


