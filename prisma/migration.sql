-- Creates triggers to update the balance of the users to always reflect the correct balance after a transaction is inserted, deleted, or modified.
create trigger UpdateBalanceOfUserOnInsertedTransaction after insert on `Transaction` begin 
    update User set balance = balance + new.amount where new.recipientId = id;
    update User set balance = balance - new.amount where new.initiatorId = id;
end;
create trigger UpdateBalanceOfUserOnDeletedTransaction after delete on `Transaction` begin 
    update User set balance = balance - old.amount where old.recipientId = id;
    update User set balance = balance + old.amount where old.initiatorId = id;
end;
create trigger UpdateBalanceOfUserOnModifiedTransactions after update on `Transaction` begin 
    update User set balance = balance - old.amount where old.recipientId = id;
    update User set balance = balance + old.amount where old.initiatorId = id;
    update User set balance = balance + new.amount where new.recipientId = id;
    update User set balance = balance - new.amount where new.initiatorId = id;
end;

-- Creates triggers to update the lastActive of the users to always reflect the last time they were involved in a transaction.
create trigger UpdateLastActiveOfUserOnBalanceChange after update of balance on `User` begin 
    update User set lastActive = CURRENT_TIMESTAMP where new.recipientId = id;
    update User set lastActive = CURRENT_TIMESTAMP where new.initiatorId = id;
end;