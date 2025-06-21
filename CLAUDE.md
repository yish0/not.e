# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

- 토큰 사용 최소화를 위해서 어떤 언어로 프롬프트를 입력해도 내부에서는 영어로 처리하고 최종 출력만 프롬프트에 사용된 언어로 출력해.
- 패키지매니저는 언제나 bun을 사용해주고, typescript에서는 ;(세미콜론)은 사용하지 않는 방침으로 해줘.
- formatter는 prettier를 사용해
- 작업이 완료된 후에는 항상 적절한 작업단위로 commit을 하고, 나중에 commit log로부터 너가 무었을 했는지 알기쉽게 commit메세지를 작성해줘.
- 항상 작업이 완료된 후에는 너가 이번작업을 통해 새롭게 배운내용이나 주의할 점을 CLAUDE.md에 기록해둬.

## Repository Status

This repository (not.e) is currently empty and awaiting initial project setup. When code is added, this file should be updated with:

- Build, test, and development commands
- Architecture overview and key patterns
- Project-specific development guidelines

## Current Setup

- Repository: yish0/not.e
- Remote: ssh://git@github.com/yish0/not.e.git
- Claude permissions configured via .claude/settings.local.json
