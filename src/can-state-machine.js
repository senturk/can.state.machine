"use strict";
/**
 * the CanStateMachine is a concept of web creation and programming of backend models, by wrapping
 * the complete model into a statemachine, handling the single states and transitions.
 * 
 * Important:
 * the initial status is always: "start", and the final always "end"
 * 
 * @author cn.sntrk
 * @version 0.1
 * @date 2022-03-31
 */

class CanStateMachine {

    static ASYNCHRONOUS = "asynchrounous call waiting for next step";

    constructor(options = {}) {
        this.data = {};     // is a data object, for users requirements
        this.states = {};
        this.transitions = [];

        this.metrics = {
            loop_counter: 0,
            states: 0,
            transitions: 0,
            log: [],
            execution: {
                start: new Date(),
                end: 0,
                duration: 0
            }
        };

        this.config_loop_max = options.loopMax || -1;
        this.loop_max = this.config_loop_max > 0 ? this.config_loop_max : 1;
    }

    // the duration till now.
    get_duration() {
        return new Date() - this.metrics.execution.start;
    }

    addStatus(status_name, status_function) {
        var case_insensitive_status_name = status_name.toLowerCase();
        // add this status function to the list. override is not allowed
        if (this.states[case_insensitive_status_name]) {
            throw new Error("WebStateMachine status already existing. Overwrite is not alled! Status-name: '" + status_name + "' -> important the status name is not case sensitive!!");
        } else {
            this.states[case_insensitive_status_name] = status_function;
        }
    }

    /**
     * adding a new transition from the one state to the other state.
     * 
     * Overwriting a transition is not allowed. This function will fire an error, if the transition
     * combination (from -> to) is already existing in the set.
     * 
     * it is important to tell, that self-transition is allowed as well!
     * 
     * @param {string} status_name_from 
     * @param {string} status_name_to 
     * @param {funciton} transition_function 
     */
    addTransition(status_name_from, status_name_to, transition_function) {

        var case_insensitive_status_name_from = status_name_from.toLowerCase();
        var case_insensitive_status_name_to = status_name_to.toLowerCase();

        // transition combination should not exist.
        var transition_existing = this._find_transition(case_insensitive_status_name_from, case_insensitive_status_name_to);
        if (transition_existing) {
            throw new Error("Transition from one state to the other state is already set: '" + status_name_from + "' -> '" + status_name_to + "' | important: the status names are case insensitive!");
        }

        this.transitions.push({
            status_from: case_insensitive_status_name_from,
            status_to: case_insensitive_status_name_to,
            transition_function: transition_function
        });
    }


    /**
     * checks, if the WebStateMachine is ready to run.
     * 
     * Today, that test is really just, if the start and end status are exising
     */
    check() {
        var rv = false;

        if (!this.states.start) {
            return false;
        } else if (!this.states.end) {
            return false;
        } else if (this.states.start && this.states.end) {
            // everything is fine!
            rv = true;
        } else {
            // start or end is missing, that is wrong
            rv = false;
        }
        return rv;
    }

    start() {
        // first check it
        if (!this.check()) {
            throw new Error("The WebStateMachine is not configured well!");
        }

        this.previous_status = undefined;
        this.current_status = undefined;
        this.finished = false;

        // metrics for starting :)
        this.metrics.execution.start = new Date();

        this.asyncProceed("start");
    }

    asyncProceed(par_status) {
        this.next_status = par_status;

        if (this.next_status) this.next_status = this.next_status.toLowerCase();

        var asynchronous_call_waited = false;

        while (!this.finished
            && this.next_status
            && this.metrics.loop_counter < this.loop_max
            && !asynchronous_call_waited) {
            this.metrics.loop_counter++;
            // if loopmax is infinitife, then loop_max is one ahead :)
            if( this.config_loop_max <= 0 ) { this.loop_max = this.metrics.loop_counter + 1 };

            var transition = this._find_transition(this.current_status, this.next_status);

            if (transition) {
                this.metrics.log.push("'" + this.current_status + "' -> '" + this.next_status + "'");
                console.log("transition: %s -> %s, loop_count: %i", this.current_status, this.next_status, this.metrics.loop_counter);

                transition.transition_function();

                transition = undefined;
            }

            this.previous_status = this.current_status;
            this.current_status = this.next_status;

            this.metrics.log.push(this.current_status);

            this.next_status = this.states[this.current_status](this.previous_status);

            if (this.next_status === CanStateMachine.ASYNCHRONOUS) { // Updated reference
                asynchronous_call_waited = true;
            } else {
                if (this.next_status) this.next_status = this.next_status.toLowerCase();

                if (this.next_status === undefined && this.current_status === "end") {
                } else if (!this.states[this.next_status]) {
                    throw new Error("Status not existing: '" + this.next_status + "' returned from status: '" + this.current_status + "'");
                }

                if (this.current_status === "end") {
                    this.finished = true;
                    this.metrics.execution.end = new Date();
                    this.metrics.execution.duration = this.metrics.execution.end - this.metrics.execution.start;
                }
            }
        }

        if( this.metrics.loop_counter >= this.loop_max ) {
            throw new Error("CanStateMachine Loop Max Counter reached: '" + this.loop_max + "' change configuration, or find issue.");
        }

    }

    _find_transition(from, to) {
        var returnValue = this.transitions.find(x => {
            if (x.status_from === from &&
                x.status_to === to) {
                // found this
                return true;
            } else {
                return false;
            }
        });

        return returnValue;
    }

}

// Universal Module Definition (UMD)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CanStateMachine; // Node.js export
} else if (typeof window !== 'undefined') {
    window.csm = CanStateMachine; // Browser global variable
}