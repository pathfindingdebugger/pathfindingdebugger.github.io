package pgraph;

public enum EventType{
    START("start"),
    EXPANDING("expanding"),
    GENERATING("generating"),
    UPDATING("updating"),
    CLOSING("closing"),
    END("end");
   private final String text;

   private EventType(final String text)
   {
        this.text = text;
   }
   @Override
   public String toString()
   {
        return text;
   }
}