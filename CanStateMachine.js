"use strict";
/**
 * the WebStateMachine is s concecpt of web creation and programming of backend models, by wrapping
 * the complete model into a statemachine, handling the single states and transitions.
 * 
 * Important:
 * the initial status is always: "start", and the final always "end"
 * 
 * @author cn.sntrk
 * @version 0.1
 * @date 2022-03-31
 */

class WebStateMachine {

    static ASYNCHRONOUS = "asynchrounous call waiting for next step";

    constructor() {
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
        },
            this.loop_max = 99;
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

        // we handle only lowercase status
        if (this.next_status) this.next_status = this.next_status.toLowerCase();

        var asynchronous_call_waited = false;

        while (!this.finished
            && this.next_status
            && this.metrics.loop_counter < this.loop_max
            && !asynchronous_call_waited) {
            this.metrics.loop_counter++;

            // first the transition. 
            // ?Why transition first?
            // the transition is the "arrow" between the status. So if there is something to switch
            // or adapt, then the transition could cover that up.
            // but the transistion requires to know the from and the to. That "to" will be defined
            // by the status itelf.
            // We run that loop here first with the start, but after that, we run the rest. and 
            // that is the reason, why the transition need to be fired before the next status will
            // be settled
            var transition = this._find_transition(this.current_status, this.next_status);

            if (transition) {
                this.metrics.log.push("'" + this.current_status + "' -> '" + this.next_status + "'");
                console.log("transition: %s -> %s, loop_count: %i", this.current_status, this.next_status, this.metrics.loop_counter);

                // if there is a transition stored for that combination, then run that.
                transition.transition_function();

                // after being fired, delete this transition
                transition = undefined;
            }

            // here we switch from next status to current status
            this.previous_status = this.current_status;
            this.current_status = this.next_status;

            this.metrics.log.push(this.current_status);

            // console.log("status: %s, loop_count: %i", this.current_status, this.metrics.loop_counter);

            /**
             * call the function of previous status
             */
            this.next_status = this.states[this.current_status](this.previous_status);

            if (this.next_status === WebStateMachine.ASYNCHRONOUS) {
                // this is an asynchronous call, therefore we will stop the processing of the loop here and wait for the 
                // external injection 
                asynchronous_call_waited = true;
            } else {
                // we handle only lowercase status
                if (this.next_status) this.next_status = this.next_status.toLowerCase();

                // exception for "end" status. ... we don't need anything else
                if (this.next_status === undefined && this.current_status === "end") {
                    // don't need to check anything ...
                } else if (!this.states[this.next_status]) {
                    // check if ths new status is existing
                    // this status is not existing, throw an error
                    throw new Error("Status not existing: '" + this.next_status + "' returned from status: '" + this.current_status + "'");
                }

                // if the status, we have fired right now was "end", then we finish the statemachine 
                // right here
                if (this.current_status === "end") {
                    this.finished = true;
                    // metrics
                    this.metrics.execution.end = new Date();
                    this.metrics.execution.duration = this.metrics.execution.end - this.metrics.execution.start;
                }
            }
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

module.exports = WebStateMachine;