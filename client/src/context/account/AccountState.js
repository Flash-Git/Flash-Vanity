import React, { useReducer } from "react";

import AccountContext from "./AccountContext";
import AccountReducer from "./AccountReducer";

import { ADD_ACCOUNT, REMOVE_ACCOUNT, CLEAR_ACCOUNTS } from "../types";

const AccountState = props => {
  const [state, dispatch] = useReducer(AccountReducer, []);

  /*
   * Actions
   */

  const addAccount = account => {
    dispatch({
      type: ADD_ACCOUNT,
      payload: account
    });
  };

  const removeAccount = address => {
    dispatch({
      type: REMOVE_ACCOUNT,
      payload: address
    });
  };

  const clearAccounts = () => {
    dispatch({
      type: CLEAR_ACCOUNTS
    });
  };

  return (
    <AccountContext.Provider
      value={{
        accounts: state,
        addAccount,
        removeAccount,
        clearAccounts
      }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountState;
