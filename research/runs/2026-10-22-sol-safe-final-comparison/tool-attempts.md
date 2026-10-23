# Tool-level attempts and preserved failures

No historical timestamps are reconstructed here. `commands.jsonl` contains timestamps actually captured by the execution wrappers; the source conversation contains the preliminary read-only discovery and file-tool edits.

## Intended RED tests

`pins-red.txt` rejected the previous candidate input pin; `matrix-red.txt` rejected a deliberately omitted silhouette class (72 instead of 108); `evidence-red.txt` rejected missing final captures/measurements/review/gallery. These are actual executions, not invented output. Green logs are kept separately.

## Setup failure and fix

The first `prepare.py` execution exited 1; exact stdout/stderr is `prepare.txt`, and the command/timing is in `commands.jsonl`. Its newly added guard incorrectly expected `environment.json.browser` in the original package. Inspection showed the original schema instead records `dependencyVersions` and `cachedHeadlessExecutables`. The guard was corrected to verify exact dependency versions and executable SHA-256, not bypassed. `prepare-retry.txt` records success. No captures or GLBs were changed by this failure.

Verbatim terminal failure tail from the encompassing setup invocation (exit 1):

```text
Traceback (most recent call last):
  File "/workspace/research/runs/2026-10-22-sol-safe-final-comparison/setup.py", line 40, in <module>
    run(['python',str(p/'prepare.py')],'prepare.txt')
    ~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/workspace/research/runs/2026-10-22-sol-safe-final-comparison/setup.py", line 20, in run
    print(json.dumps(rec),flush=True);assert (r.returncode==0)==(expected==0),(args,r.returncode)
                                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError: (['python', '/workspace/research/runs/2026-10-22-sol-safe-final-comparison/prepare.py'], 1)
```

## Tool invocation rejected before execution

The initial `terminal` request for `log-command.py full-execution.txt python .../execute.py` included `notify:true` without `background:true`. Exact returned error:

```text
notify only applies to background commands (foreground results return directly). Either drop it, or run as terminal(command=..., background=true, notify=...).
```

It did not execute. The corrected background invocation owns process `proc_37311b63a52a`.

## Visual packaging wait timeout, not failed computation

The foreground call running `log-command.py package-visual.txt python .../package.py --visual-only` used a 60-second tool wait. Exact tool result:

```json
{"output":"[Command timed out after 60s]","exit_code":124,"error":null,"hint":"Exit 124: the command hit its timeout. Raise timeout= (foreground max 600s) or run it with background=true and notify_on_complete=true."}
```

Read-only process discovery confirmed the child was **still running**. It was not rerun or killed. It eventually completed successfully, with its real elapsed duration/exit status in `commands.jsonl` and stdout in `package-visual.txt`. The nine sheets and image-difference diagnostics were produced once, not invented after the timeout. The metrics summary uses a separate cheap `summarize.py` so the unchanged visual matrix is not regenerated.

## Measurement limits

Fast unit/script/render-plan tests finished during capture, before measurement. Native/sheet packaging overlapped the first control measurement context; gallery decoding also occurred during acquisition. These timings are actual software-renderer diagnostic samples with uncontrolled host scheduling and caches, not a CPU-isolated benchmark or production GPU ranking. ABBA measurements are not silently discarded or replaced due to timing variation.

The unchanged generic `scope` text inside each raw measurement says “shared browser process,” because the proven harness also supports a comma-list mode within one invocation. That generic phrase does not describe this execution across ABBA: `execute.py` called four separate one-model Node invocations, each launching and closing its own Chromium process/context. The executed argv/ordering is preserved, and `metrics-summary.json` describes the actual separate-process method. Raw files are not rewritten to repair the generic prose.

Disposable script-test fixture directories under this package were removed after tests; `cleanup-test-fixtures.txt` records the actual deletion count. Real failures, rendered evidence and raw measurement logs are retained.
