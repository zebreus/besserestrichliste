-- This is an empty migration.

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