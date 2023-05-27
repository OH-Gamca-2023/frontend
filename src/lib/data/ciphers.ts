import { getCipherSubmissions, type ErrorResponse } from "$lib/api";
import { clazzes, grades } from "$lib/state";
import type { Cipher } from "$lib/types";
import { LoadableModel } from "$lib/utils/models";

export const ciphers = new LoadableModel<Cipher>("ciphers", (raw) => {
    const rawData = raw as any;
    
    const base = {
        id: rawData.id,
        start: new Date(rawData.start),
        started: rawData.started,
        hint_visible: rawData.hint_visible,
        end: new Date(rawData.end),
        has_ended: rawData.has_ended,
        classes: new Map(),
        submissions: [],
    } as Cipher

    if (rawData.hint_publish_time) {
        base.hint_publish_time = new Date(rawData.hint_publish_time)
    }

    if (base.started) {
        base.name = rawData.name
        base.task_file = rawData.task_file

        for (const clazz in rawData.classes) {
            base.classes.set(clazzes.get(clazz)!, {
                solved: rawData.classes[clazz].solved,
                after_hint: rawData.classes[clazz].after_hint,
                attempts: rawData.classes[clazz].attempts,
            })
        }
    }

    if (base.hint_visible) {
        base.hint = rawData.hint_text
    }

    if (base.started) loadSubmissions(base)

    return base

}, false, [clazzes, grades], 'list', true, true)

async function loadSubmissions(cipher: Cipher) {
    const submissions = await getCipherSubmissions(cipher.id)
    if (submissions.error) {
        console.error((submissions as ErrorResponse).errorCode, (submissions as ErrorResponse).errorMessage)
        return
    }
    if (!submissions.data) {
        console.error("No submissions data received for cipher", cipher.id)
        return
    }

    cipher.submissions = submissions.data
    ciphers.set(cipher.id, cipher)
}