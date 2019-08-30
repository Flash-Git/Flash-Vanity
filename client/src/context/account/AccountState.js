import React, { useReducer } from "react";

import AccountContext from "./AccountContext";
import AccountReducer from "./AccountReducer";

import { ADD_ACCOUNT, REMOVE_ACCOUNT } from "../types";

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

  return (
    <AccountContext.Provider
      value={{
        accounts: state,
        addAccount,
        removeAccount
      }}
    >
      {props.children}
    </AccountContext.Provider>
  );
};

export default AccountState;
