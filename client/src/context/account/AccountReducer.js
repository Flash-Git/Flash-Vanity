import { ADD_ACCOUNT, REMOVE_ACCOUNT } from "../types";

export default (state, action) => {
  switch (action.type) {
    case ADD_ACCOUNT:
      return [...state, action.payload];
    case REMOVE_ACCOUNT:
      return state.filter(account => account.address !== action.payload);
    default:
      return state;
  }
};
